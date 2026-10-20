// ============================================================
// ИКОНКИ ВАЛЮТ, ВСТРОЕННЫЕ В КОД (data URI)
// ============================================================
// В Telegram WebView на телефоне картинки валют часто не загружаются:
// внешние адреса (pinimg, yandex, wikia) там блокируются, а относительный
// путь assets/*.png может не открыться, если игра запущена из другого места.
// Вместо иконки игрок видел «битую» картинку. Встроенная в код картинка
// не требует ни сети, ни файлов — она есть всегда.
//
// Файл подключается ПЕРЕД script.js, поэтому window.GAME_CURRENCY_ICONS
// уже доступен, когда игра строит свои иконки.
(function () {
    const ICONS = {
        dilick: 'data:image/png;base64,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',
        money: 'data:image/png;base64,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'
    };
    window.GAME_CURRENCY_ICONS = ICONS;

    // Какие адреса считаем иконкой валюты и чем их заменяем.
    // Последние два шаблона — старые внешние адреса, которые остались
    // в разметке и в базе; их тоже подменяем на встроенные.
    const PATTERNS = [
        { re: /assets\/dilick\.png/i, src: ICONS.dilick },
        { re: /assets\/money\.png/i, src: ICONS.money },
        { re: /pinimg\.com.*df[/_-]?49[/_-]?fd/i, src: ICONS.dilick },
        { re: /avatars\.mds\.yandex\.net.*d2747e92/i, src: ICONS.money }
    ];

    function resolve(src) {
        if (!src || typeof src !== 'string') return null;
        if (src.indexOf('data:') === 0) return null;   // уже встроенная
        for (let i = 0; i < PATTERNS.length; i++) {
            if (PATTERNS[i].re.test(src)) return PATTERNS[i].src;
        }
        return null;
    }

    function fixImg(img) {
        if (!img || img.tagName !== 'IMG') return;
        const next = resolve(img.getAttribute('src') || '');
        if (!next) return;
        // Убираем старый onerror: он вёл на внешний адрес, который на
        // телефоне тоже не грузится, и картинка оставалась битой.
        img.removeAttribute('onerror');
        img.setAttribute('src', next);
    }

    function fixAll(root) {
        const scope = root || document;
        if (scope.tagName === 'IMG') fixImg(scope);
        const imgs = scope.querySelectorAll ? scope.querySelectorAll('img') : [];
        for (let i = 0; i < imgs.length; i++) fixImg(imgs[i]);
    }

    // Разметка, которая приходит из базы или рисуется игрой (тосты, задания,
    // награды, результаты колеса), появляется позже — следим за ней.
    function observe() {
        if (typeof MutationObserver === 'undefined' || !document.body) return;
        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                const added = mutations[i].addedNodes;
                for (let j = 0; j < added.length; j++) {
                    const node = added[j];
                    if (node.nodeType === 1) fixAll(node);
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Страховка: если картинка всё-таки не загрузилась, подменяем её
    // встроенной. Обработчик на фазе перехвата ловит ошибки у любых img.
    document.addEventListener('error', (e) => {
        const img = e.target;
        if (!img || img.tagName !== 'IMG') return;
        const original = img.getAttribute('src') || '';
        const next = resolve(original) || (img.classList.contains('dilic-icon') || img.classList.contains('currency-icon')
            ? (img.alt && /деньг|money|монет/i.test(img.alt) ? ICONS.money : ICONS.dilick)
            : null);
        if (next && original.indexOf('data:') !== 0) {
            img.removeAttribute('onerror');
            img.setAttribute('src', next);
        }
    }, true);

    window.fixCurrencyIcons = fixAll;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { fixAll(); observe(); });
    } else {
        fixAll(); observe();
    }
})();