// ============================================================
//  ОТКАТ СЕЗОНА — переход со 150 уровней на 50
// ============================================================
//  Что делает:
//   1) уровень сезона   -> 1
//   2) опыт сезона      -> 0
//   3) забранные награды -> очищаются (лента снова доступна для сбора)
//   4) сезонные скины ДИЛИК МАСТЕР / ЛОРД / КОРОЛЬ -> забираются у тех,
//      кто забирал награды (и снимаются с экипировки, если были надеты)
//
//  НЕ трогает: дилики, монеты, премиум-пропуск, клики, обычные скины,
//              достижения, промокоды, прогресс ивентов.
//
//  Запуск (из этой папки):
//     node migrate-season.js           -- предпросмотр, ничего не меняет
//     node migrate-season.js --apply   -- применить
//
//  Отмена (если результат не устроил):
//     node migrate-season.js --rollback
// ============================================================

const DB = 'https://dilic-clicker-default-rtdb.europe-west1.firebasedatabase.app';
const MAX_SEASON_LEVEL = 50;
// Должно совпадать с SEASON_VERSION в script.js
const SEASON_VERSION = 2;

// Скины, которые выдавались ТОЛЬКО за уровни сезона
const SEASON_SKINS = ['uragan_dragon_top3', 'uragan_holo_top10', 'uragan_banana_top50'];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const ROLLBACK = args.includes('--rollback');

const fs = require('fs');
const path = require('path');
const BACKUP_FILE = path.join(__dirname, 'season-migration-backup.json');

async function getJSON(url, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const text = await res.text();
            return text ? JSON.parse(text) : null;
        } catch (e) {
            if (i === tries - 1) throw e;
            await new Promise(r => setTimeout(r, 800));
        }
    }
}

async function putJSON(url, value) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()));
    return true;
}

async function patch(url, obj) {
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()));
    return true;
}

// ---------- ОТКАТ ----------
async function rollback() {
    if (!fs.existsSync(BACKUP_FILE)) {
        console.error('❌ Файл резервной копии не найден: ' + BACKUP_FILE);
        process.exit(1);
    }
    const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    const ids = Object.keys(backup);
    console.log('↩️  Восстанавливаю ' + ids.length + ' профилей из резервной копии...\n');
    for (const id of ids) {
        const before = backup[id];
        try {
            await patch(DB + '/users/' + id + '.json', {
                seasonLevel: before.seasonLevel,
                seasonExp: before.seasonExp,
                seasonClaimed: before.seasonClaimed,
                inventory: before.inventory,
                currentSkin: before.currentSkin
            });
            console.log('   ↩️  ' + (before.username || id) + ' восстановлен (LVL ' + before.seasonLevel + ')');
        } catch (e) {
            console.error('   ❌ ' + id + ': ' + e.message);
        }
    }
    console.log('\n✅ Откат завершён.');
}

// ---------- ОСНОВНАЯ МИГРАЦИЯ ----------
async function migrate() {
    console.log('='.repeat(62));
    console.log(APPLY ? '  ПРИМЕНЕНИЕ ОТКАТА СЕЗОНА' : '  ПРЕДПРОСМОТР (ничего не меняется)');
    console.log('='.repeat(62) + '\n');

    const shallow = await getJSON(DB + '/users.json?shallow=true');
    if (!shallow) { console.error('❌ Не удалось получить список игроков'); process.exit(1); }
    const ids = Object.keys(shallow);
    console.log('Игроков в базе: ' + ids.length + '\n');

    const backup = {};
    const plan = [];

    for (const id of ids) {
        let u;
        try {
            u = await getJSON(DB + '/users/' + id + '.json');
        } catch (e) {
            console.error('   ⚠️  Не удалось прочитать ' + id + ': ' + e.message + ' (пропускаю)');
            continue;
        }
        if (!u) continue;

        const invBefore = Array.isArray(u.inventory) ? u.inventory.slice() : [];
        const claimedBefore = u.seasonClaimed || null;
        const claimedCount = claimedBefore
            ? ((claimedBefore.free ? claimedBefore.free.length : 0) + (claimedBefore.premium ? claimedBefore.premium.length : 0))
            : 0;

        // Скины сезона снимаем только у тех, кто реально забирал сезонные награды,
        // чтобы не тронуть скины, полученные другим путём.
        const hadClaimed = claimedCount > 0;
        const skinsToRemove = hadClaimed ? invBefore.filter(s => SEASON_SKINS.includes(s)) : [];
        const invAfter = invBefore.filter(s => !skinsToRemove.includes(s));

        // Если надет сезонный скин — возвращаем классический
        let skinAfter = u.currentSkin || 'classic';
        let skinChanged = false;
        if (skinsToRemove.includes(skinAfter)) { skinAfter = 'classic'; skinChanged = true; }

        const changes = [];
        if ((u.seasonLevel || 1) !== 1) changes.push('уровень ' + (u.seasonLevel || 1) + ' → 1');
        if ((u.seasonExp || 0) !== 0) changes.push('опыт ' + (u.seasonExp || 0) + ' → 0');
        if (claimedCount > 0) changes.push('забранные награды ' + claimedCount + ' шт → очищено');
        if (skinsToRemove.length) changes.push('скины: ' + skinsToRemove.join(', ') + ' → изъято');
        if (skinChanged) changes.push('экипировка → classic');

        backup[id] = {
            username: u.username,
            seasonLevel: u.seasonLevel === undefined ? 1 : u.seasonLevel,
            seasonExp: u.seasonExp === undefined ? 0 : u.seasonExp,
            seasonClaimed: claimedBefore,
            inventory: invBefore,
            currentSkin: u.currentSkin || 'classic'
        };

        plan.push({
            id, username: u.username || id,
            update: {
                seasonLevel: 1,
                seasonExp: 0,
                seasonClaimed: { free: [], premium: [] },
                inventory: invAfter,
                currentSkin: skinAfter,
                seasonVersion: SEASON_VERSION
            },
            changes,
            hadClaimed,
            levelBefore: u.seasonLevel || 1
        });
    }

    // ---------- отчёт ----------
    const affected = plan.filter(p => p.changes.length > 0);
    const untouched = plan.filter(p => p.changes.length === 0);

    console.log('--- БУДУТ ИЗМЕНЕНЫ (' + affected.length + ') ---');
    if (!affected.length) console.log('   (нет)');
    for (const p of affected) {
        console.log('   ' + p.username.padEnd(18) + ' ' + p.changes.join('; '));
    }
    console.log('\n--- БЕЗ ИЗМЕНЕНИЙ (' + untouched.length + ') ---');
    console.log('   ' + (untouched.map(p => p.username).join(', ') || '(нет)') + '\n');

    console.log('Проверка: НЕ трогаем дилики, монеты, премиум-пропуск, клики, достижения.\n');

    if (!APPLY) {
        console.log('Это предпросмотр. Чтобы применить, запусти:');
        console.log('   node migrate-season.js --apply\n');
        return;
    }

    // ---------- резервная копия ----------
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf8');
    console.log('💾 Резервная копия сохранена: ' + BACKUP_FILE + '\n');

    // ---------- применение ----------
    console.log('Применяю...');
    let ok = 0, fail = 0;
    for (const p of plan) {
        try {
            await patch(DB + '/users/' + p.id + '.json', p.update);
            ok++;
            console.log('   ✅ ' + p.username + (p.changes.length ? ' — ' + p.changes.join('; ') : ' — без изменений'));
        } catch (e) {
            fail++;
            console.error('   ❌ ' + p.username + ': ' + e.message);
        }
    }

    console.log('\n' + '='.repeat(62));
    console.log('Готово. Обновлено: ' + ok + ', ошибок: ' + fail);
    console.log('Отменить всё: node migrate-season.js --rollback');
    console.log('='.repeat(62));
}

(ROLLBACK ? rollback() : migrate()).catch(e => {
    console.error('❌ Ошибка: ' + e.message);
    process.exit(1);
});
