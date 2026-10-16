// register.js
localStorage.removeItem('currentUser');
localStorage.removeItem('userId');

// ============================================================
//  НАДЁЖНЫЙ ПОИСК ИГРОКА
// ============================================================
//  Раньше вход и регистрация использовали только запрос
//      ref('users').orderByChild('username').equalTo(username)
//  Он требует индекс по полю username в правилах базы. Индекса нет, поэтому
//  Firebase пытался скачать ВСЮ ветку users и запрос висел бесконечно:
//  кнопка «Войти» не делала ничего, и войти было невозможно.
//  Сервер на такой запрос отвечает ошибкой 400 — проверено напрямую.
//
//  Теперь вход не зависит от индексов: получаем список игроков (shallow) и
//  проверяем ники по одному. Это работает всегда и занимает 1-2 секунды.
const AUTH = {
    // промис Firebase отменить нельзя, поэтому просто перестаём его ждать
    withTimeout(promise, ms) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                reject(new Error('timeout ' + ms + 'ms'));
            }, ms);
            promise.then(
                (v) => { if (!settled) { settled = true; clearTimeout(timer); resolve(v); } },
                (e) => { if (!settled) { settled = true; clearTimeout(timer); reject(e); } }
            );
        });
    },

    // Запомненные на этом устройстве связки «логин -> ID». Благодаря им повторный
    // вход не требует перебора: сразу открываем нужный профиль по ID.
    _mapKey: 'dilicUserIds',
    loadMap() {
        try { return JSON.parse(localStorage.getItem(AUTH._mapKey) || '{}') || {}; }
        catch (e) { return {}; }
    },
    remember(username, id) {
        if (!username || !id) return;
        try {
            const map = AUTH.loadMap();
            map[String(username).trim().toLowerCase()] = id;
            localStorage.setItem(AUTH._mapKey, JSON.stringify(map));
        } catch (e) { /* localStorage может быть недоступен */ }
    },

    // ВАЖНО: метод .shallow() есть только у REST API Firebase, в SDK v8 его НЕТ —
    // вызов падал с «shallow is not a function». Поэтому список игроков берём
    // обычным HTTPS-запросом, благо база и так публичная.
    // Адрес ищем в нескольких местах: firebase.app().options бывает пустым.
    _baseUrl() {
        const clean = (u) => String(u || '').replace(/\/+$/, '');
        let url = '';
        try {
            if (typeof firebaseConfig !== 'undefined' && firebaseConfig && firebaseConfig.databaseURL) {
                url = firebaseConfig.databaseURL;
            }
        } catch (e) { /* нет доступа — пробуем дальше */ }
        if (!url) {
            try { url = (firebase.app().options && firebase.app().options.databaseURL) || ''; } catch (e) { url = ''; }
        }
        if (!url) url = 'https://dilic-clicker-default-rtdb.europe-west1.firebasedatabase.app';
        return clean(url);
    },

    // Один запрос к базе. База периодически подтормаживает, поэтому при сбое
    // пробуем ещё раз — иначе один медленный ответ срывает весь вход.
    async restGet(path, ms) {
        const base = AUTH._baseUrl();
        if (!base) throw new Error('не удалось определить адрес базы');
        let lastError = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const res = await AUTH.withTimeout(fetch(base + path, { cache: 'no-store' }), ms);
                if (!res.ok) throw new Error('сервер ответил ' + res.status);
                const text = await res.text();
                return text ? JSON.parse(text) : null;
            } catch (e) {
                lastError = e;
                if (attempt === 1) {
                    console.warn('Запрос к базе не удался (' + (e && e.message) + '), повторяю:', path);
                    await new Promise(r => setTimeout(r, 400));
                }
            }
        }
        throw lastError;
    },

    // Список игроков: REST-запрос ?shallow=true (ответ — просто список ID)
    async getUserIds() {
        const data = await AUTH.restGet('/users.json?shallow=true', 10000);
        if (!data || typeof data !== 'object') return [];
        return Object.keys(data);
    },
    async fetchProfile(id) {
        const data = await AUTH.restGet('/users/' + id + '.json', 10000);
        if (!data || typeof data !== 'object') return null;
        return { id, data };
    },

    // Список игроков + проверка ников по одному. Не зависит от индексов.
    async findUser(username) {
        const wanted = String(username).trim().toLowerCase();

        // 1) Быстро: игрок уже входил с этого устройства
        const remembered = AUTH.loadMap()[wanted];
        if (remembered) {
            try {
                const profile = await AUTH.fetchProfile(remembered);
                if (profile) return profile;
            } catch (e) { /* запись устарела — ищем дальше */ }
        }

        // 2) Список игроков + проверка ников по одному
        const ids = await AUTH.getUserIds();
        if (ids.length === 0) return null;

        let cursor = 0;
        let foundId = null;

        async function worker() {
            while (cursor < ids.length && !foundId) {
                const id = ids[cursor++];
                try {
                    const name = await AUTH.restGet('/users/' + id + '/username.json', 6000);
                    if (name && String(name).toLowerCase() === wanted) foundId = id;
                } catch (e) { /* пропускаем только этого игрока */ }
            }
        }

        const workers = [];
        for (let i = 0; i < Math.min(6, ids.length); i++) workers.push(worker());
        await Promise.all(workers);
        if (!foundId) return null;

        const profile = await AUTH.fetchProfile(foundId);
        if (profile) AUTH.remember(username, foundId);   // дальше вход будет мгновенным
        return profile;
    }
};

class UserManager {
    constructor() {
        this.currentUser = null;
    }

    async register(username, password) {
        try {
            const existing = await AUTH.findUser(username);
            if (existing) {
                return { success: false, message: 'Пользователь уже существует' };
            }

            const newUserRef = firebase.database().ref('users').push();
            
            const userData = {
                username: username,
                password: password,
                clicks: 0,
                money: 1000,
                dilicks: 500,
                clickPower: 1,
                autoClickerLevel: 0,
                critChance: 5,
                inventory: ['classic'],
                currentSkin: 'classic',
                seasonLevel: 1,
                seasonExp: 0,
                // отметка версии сезона: у нового аккаунта сезон уже «новый»,
                // поэтому разовый сброс сезона ему не нужен
                seasonVersion: 2,
                seasonClaimed: { free: [], premium: [] },
                playtime: 0,
                premiumPass: false,
                completedAchievements: [],
                activatedPromocodes: [],
                promocodesHistory: [],
                compensationReceived: false,
                eventContribution: 0,
                dailyQuests: {
                    lastReset: Date.now(),
                    clicks: 0,
                    dilicksEarned: 0,
                    wheelSpins: 0,
                    upgrades: 0,
                    completed: []
                },
                lastSave: Date.now(),
                settings: {
                    displayName: username,
                    theme: 'dark',
                    notifications: true,
                    sound: true,
                    animations: true,
                    language: 'ru'
                }
            };
            
            await newUserRef.set(userData);
            console.log('✅ Новый пользователь создан:', username, 'ID:', newUserRef.key);
            return { success: true, message: 'Регистрация успешна' };
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            return { success: false, message: 'Ошибка при регистрации' };
        }
    }

    async login(username, password) {
        try {
            console.log('🔍 Поиск пользователя:', username);

            const found = await AUTH.findUser(username);
            if (!found) {
                console.log('❌ Пользователь не найден');
                return { success: false, message: 'Неверный логин или пароль' };
            }

            const userData = found.data;
            const userId = found.id;
            console.log('✅ Найден пользователь:', userData.username, 'ID:', userId);

            if (userData.password !== password) {
                console.log('❌ Пароль не совпадает');
                return { success: false, message: 'Неверный логин или пароль' };
            }

            localStorage.setItem('currentUser', userData.username);
            localStorage.setItem('userId', userId);
            // запоминаем связку ником->ID: следующий вход с этого устройства будет мгновенным
            AUTH.remember(userData.username, userId);

            console.log('✅ Вход выполнен для:', userData.username);
            return { success: true, message: 'Вход выполнен', userId: userId, userData: userData };
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            // Показываем настоящую причину, а не общую фразу — иначе невозможно понять,
            // что именно сломалось (нет связи, зависла база, ошибка кода).
            const reason = (error && (error.message || error.code)) ? (error.message || error.code) : String(error);
            return { success: false, message: 'Ошибка при входе: ' + reason };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (!username) {
            alert('❌ Введите логин');
            return;
        }
        
        if (password.length < 4) {
            alert('❌ Пароль должен быть не менее 4 символов');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('❌ Пароли не совпадают');
            return;
        }
        
        const result = await userManager.register(username, password);
        
        if (result.success) {
            alert('✅ Регистрация успешна! Теперь войдите.');
            loginTab.click();
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').value = '';
        } else {
            alert('❌ ' + result.message);
        }
    });
        
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username) {
            alert('❌ Введите логин');
            return;
        }

        // Поиск игрока может занять пару секунд — показываем, что вход идёт
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Вход...'; }

        let result;
        try {
            result = await userManager.login(username, password);
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
        
        if (result.success) {
            console.log('✅ Перенаправление в игру...');
            window.location.href = 'index.html';
        } else {
            alert('❌ ' + result.message);
        }
    });
    
    if (localStorage.getItem('currentUser') && localStorage.getItem('userId')) {
        console.log('⚠️ Уже есть сессия, перенаправление...');
        window.location.href = 'index.html';
    }
});