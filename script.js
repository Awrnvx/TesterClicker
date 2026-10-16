// ============================================
// DILIC CLICKER - ПОЛНАЯ ВЕРСИЯ 3.0 ULTRA
// ============================================

class ClickerGame {
    constructor() {
        this.userData = null;
        this.autoClickerInterval = null;
        this.playtimeInterval = null;
        this.bubbleFrame = null;
        this.lastBubbleTime = 0;
        this.settings = null;
        this.wheel = null;
        this.compensationShown = false;
        this.isLoaded = false;
        this.CREATOR_ID = typeof CREATOR_ID !== 'undefined' ? CREATOR_ID : "-OrjRkQiw3TQyxJjMi4i";
        this.currentUraganMultiplier = 1;
        this.uraganEventActive = false;
        this.questTimerInterval = null;
        this.banTimerInterval = null;
        this.maintenanceTimerInterval = null;
        this.announcementsRef = null;
        this.exchangeFrom = null;
        this._seasonAutoScrolled = false;
        
        // ===== ОПТИМИЗАЦИЯ: состояние сезонной ленты и UI =====
        this._seasonBarFrame = null;      // rAF-троттлинг прогресс-бара сезона
        this._tiersCache = null;          // кэш узлов ленты сезона (без пересоздания DOM)
        this._tiersStateKey = null;       // ключ состояния: при совпадении лента не трогается
        this._tiersFrame = null;          // rAF для отложенной сборки ленты
        this._tiersRendered = false;
        this._claimingTier = false;       // защита от двойного получения награды
        this._uiCache = {};               // кэш последних значений UI (не пишем в DOM лишний раз)
        this._saveTimer = null;           // батчинг сохранений в Firebase
        this._savePending = false;
        this._saveBound = false;
        this._eventAccum = 0;             // накопление вклада в ивент до отправки в БД
        this._eventFlushTimer = null;
        
        // Максимум уровней сезонного пропуска. Было 150 — из-за этого лента
        // строила 300 ячеек и 450 картинок, что и грузило мобильные устройства.
        this.MAX_SEASON_LEVEL = 50;
        // Версия сезона. При смене значения игра один раз перезапускает сезон
        // у игрока (см. applySeasonReset) — это защищает откат от перезаписи
        // старой открытой вкладкой.
        this.SEASON_VERSION = 2;
        // Последняя удачно загруженная таблица лидеров: показываем её сразу,
        // пока грузится свежая — база тормозит, и пустой экран раздражает.
        // Копия кладётся ещё и в localStorage, поэтому переживает перезапуск игры.
        this._leaderboardCache = this._loadLeaderboardCache();
        // Сколько игроков не удалось прочитать в последний раз (для пометки)
        this._leaderboardFailed = 0;
        // Признак идущей загрузки: не запускаем две параллельно
        this._leaderboardLoading = false;
        
        this.MONEY_ICON = 'https://avatars.mds.yandex.net/i?id=d2747e92b4fb93d8cee0b3582cb46ea6_l-5332707-images-thumbs&n=13';
        this.DILICKS_ICON = 'https://i.pinimg.com/736x/df/49/fd/df49fd562d564016dcc4070b5e83c521.jpg';
        
        this.skinsData = {
            'classic': { name: 'Классический скин', price: 0, image: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', description: 'Стандартный курсор', currency: 'money', multiplier: 1 },
            'neon': { name: 'Неоновый скин', price: 1000, image: 'https://img.freepik.com/premium-photo/neon-style-computer-cursor-arrow-design-vector_1018059-4.jpg?semt=ais_hybrid&w=740', description: 'Яркий неоновый курсор', currency: 'money', multiplier: 1 },
            'monsters_skin': { name: 'Монстр скин', price: 0, image: 'https://static.wikia.nocookie.net/d72429a0-efb9-4e95-bde1-dc811f2bfccf/scale-to-width/755', description: 'Эксклюзивный скин монстра', currency: 'money', multiplier: 1 },
            'dragon_skin': { name: 'Драконий скин', price: 15000, image: 'https://avatars.mds.yandex.net/i?id=78aac0954c4f305798014e687e3d7f1d_l-6327735-images-thumbs&n=13', description: 'Мощный скин дракона', currency: 'dilicks', multiplier: 1 },
            'wheel_dragon_skin': { name: 'Колесный дракон', price: 0, image: 'https://static.wikia.nocookie.net/59310fd4-7c46-4895-930e-6cea7982a142/scale-to-width/755', description: 'Особенный скин дракона (×250)', multiplier: 250 },
            'uragan_dragon_top3': { name: 'ДИЛИК КОРОЛЬ', price: 0, image: 'https://i.pinimg.com/736x/d3/9b/60/d39b60c70e6abbaf059e4fb5131612e8.jpg', description: '+145 множитель!', multiplier: 145 },
            'uragan_holo_top10': { name: 'ДИЛИК ЛОРД', price: 0, image: 'https://i.pinimg.com/originals/6b/0c/79/6b0c79aaba43d9d2e3f2e59c98ed98b8.jpg?nii=t', description: '+100 множитель!', multiplier: 100 },
            'uragan_banana_top50': { name: 'ДИЛИК МАСТЕР', price: 0, image: 'https://thumbs.dreamstime.com/b/старый-колдун-символ-мастера-рисунков-пикселов-иллюстрация-вектора-242507131.jpg?w=768', description: '+55 множитель!', multiplier: 55 },
            'uragan_cursor_top100': { name: 'ДИЛИК', price: 0, image: 'https://th.bing.com/th/id/R.5493d8d74a695b06470e70593ca7419c?rik=gB7Dii9D3EP3YQ&pid=ImgRaw&r=0', description: '+15 множитель!', multiplier: 15 }
        };
        
        this.achievementsData = [
            { id: 'firstClick', name: 'Первый шаг', description: 'Сделайте первый клик', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.clicks >= 1, reward: { money: 100, dilicks: 10 } },
            { id: 'clicker100', name: 'Начинающий кликер', description: 'Сделайте 100 кликов', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.clicks >= 100, reward: { money: 500, dilicks: 50 } },
            { id: 'clicker1000', name: 'Опытный кликер', description: 'Сделайте 1000 кликов', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.clicks >= 1000, reward: { money: 2000, dilicks: 200 } },
            { id: 'clicker10000', name: 'Профессионал', description: 'Сделайте 10000 кликов', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.clicks >= 10000, reward: { money: 10000, dilicks: 1000 } },
            { id: 'clicker100000', name: 'Легенда кликов', description: 'Сделайте 100000 кликов', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.clicks >= 100000, reward: { money: 50000, dilicks: 5000 } },
            { id: 'richMan', name: 'Богач', description: 'Накопите 10000 денег', icon: this.MONEY_ICON, condition: (data) => data.money >= 10000, reward: { money: 0, dilicks: 500 } },
            { id: 'millionaire', name: 'Миллионер', description: 'Накопите 1 000 000 денег', icon: this.MONEY_ICON, condition: (data) => data.money >= 1000000, reward: { money: 0, dilicks: 5000 } },
            { id: 'dilicMaster', name: 'Мастер диликов', description: 'Накопите 5000 диликов', icon: this.DILICKS_ICON, condition: (data) => data.dilicks >= 5000, reward: { money: 5000, dilicks: 0 } },
            { id: 'dilicLord', name: 'Повелитель диликов', description: 'Накопите 50000 диликов', icon: this.DILICKS_ICON, condition: (data) => data.dilicks >= 50000, reward: { money: 25000, dilicks: 5000 } },
            { id: 'skinCollector', name: 'Коллекционер', description: 'Соберите все скины', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.inventory && data.inventory.length >= 9, reward: { money: 35000, dilicks: 0 } },
            { id: 'critMaster', name: 'Повелитель критов', description: 'Увеличьте шанс крита до 50%', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.critChance >= 50, reward: { money: 2000, dilicks: 200 } },
            { id: 'critGod', name: 'Бог критов', description: 'Увеличьте шанс крита до 100%', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.critChance >= 100, reward: { money: 10000, dilicks: 1000 } },
            { id: 'autoClickerMaster', name: 'Автоматизация', description: 'Купите 10 уровней автокликера', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.autoClickerLevel >= 10, reward: { money: 5000, dilicks: 500 } },
            { id: 'autoClickerGod', name: 'Полная автоматизация', description: 'Купите 50 уровней автокликера', icon: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', condition: (data) => data.autoClickerLevel >= 50, reward: { money: 25000, dilicks: 2500 } },
            { id: 'wheelMaster', name: 'Властелин колеса', description: 'Получите особенного скина из колеса фортуны', icon: 'https://static.wikia.nocookie.net/59310fd4-7c46-4895-930e-6cea7982a142/scale-to-width/755', condition: (data) => data.inventory && data.inventory.includes('wheel_dragon_skin'), reward: { money: 10000, dilicks: 5000 } },
            { id: 'uraganKing', name: 'Король урагана', description: 'Получите скин ДИЛИК КОРОЛЬ в ивенте', icon: this.DILICKS_ICON, condition: (data) => data.inventory && data.inventory.includes('uragan_dragon_top3'), reward: { money: 50000, dilicks: 10000 } },
            { id: 'uraganLord', name: 'Повелитель урагана', description: 'Получите скин ДИЛИК ЛОРД в ивенте', icon: this.DILICKS_ICON, condition: (data) => data.inventory && data.inventory.includes('uragan_holo_top10'), reward: { money: 25000, dilicks: 5000 } }
        ];
        
        this.promocodesData = {
            'WELCOME': { code: 'WELCOME', reward: { money: 500, dilicks: 100 }, description: 'Приветственный бонус', maxActivations: 1, expiryDate: null },
            'DILICKS100': { code: 'DILICKS100', reward: { money: 0, dilicks: 100 }, description: '100 диликов в подарок', maxActivations: 1, expiryDate: null },
            'MONEY1000': { code: 'MONEY1000', reward: { money: 1000, dilicks: 0 }, description: '1000 монет', maxActivations: 1, expiryDate: null },
            'CLICKER2024': { code: 'CLICKER2024', reward: { money: 500, dilicks: 50 }, description: 'Новогодний промокод', maxActivations: 1, expiryDate: new Date('2024-12-31').getTime() },
            'SUPERBONUS': { code: 'SUPERBONUS', reward: { money: 2000, dilicks: 200 }, description: 'Супер бонус', maxActivations: 1, expiryDate: null },
            'NEONLOVER': { code: 'NEONLOVER', reward: { money: 1500, dilicks: 150 }, description: 'Для любителей неона', maxActivations: 1, expiryDate: null },
            'MONSTERS-SKIN': { code: 'MONSTERS-SKIN', reward: { money: 0, dilicks: 0, skin: 'monsters_skin' }, description: 'Скин монстра в подарок!', maxActivations: 1, expiryDate: null },
            'DRAGON-SKIN': { code: 'DRAGON-SKIN', reward: { money: 0, dilicks: 0, skin: 'dragon_skin' }, description: 'Скин дракона в подарок!', maxActivations: 1, expiryDate: null },
            'URAGAN100': { code: 'URAGAN100', reward: { money: 0, dilicks: 1000 }, description: '1000 диликов для урагана!', maxActivations: 1, expiryDate: null }
        };
        
        this.init();
    }
    
    getSkinMultiplier(skinId) {
        const multipliers = {
            'uragan_dragon_top3': 145,
            'uragan_holo_top10': 100,
            'uragan_banana_top50': 55,
            'uragan_cursor_top100': 15,
            'wheel_dragon_skin': 250
        };
        return multipliers[skinId] || 1;
    }
    
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showLoader(show) {
        let loader = document.getElementById('globalLoader');
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(15px);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;transition:opacity 0.3s;`;
                loader.innerHTML = `<div style="width:70px;height:70px;border:4px solid rgba(255,215,0,0.2);border-top:4px solid gold;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="color:gold;font-size:1.2rem;">Загрузка...</p><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`;
                document.body.appendChild(loader);
            }
            loader.style.opacity = '1';
            loader.style.visibility = 'visible';
        } else if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { if (loader && loader.parentNode) loader.remove(); }, 300);
        }
    }
    
    initBanListener() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const banRef = firebase.database().ref('ban/' + userId);
        banRef.on('value', (snapshot) => {
            const banData = snapshot.val();
            if (this.banTimerInterval) clearInterval(this.banTimerInterval);
            if (banData && banData.active === true) {
                if (!banData.isPermanent && banData.endTime && banData.endTime < Date.now()) {
                    banRef.remove();
                    this.hideBanScreen();
                    return;
                }
                this.showBanScreen(banData.reason, banData.endTime, banData.isPermanent);
                if (!banData.isPermanent && banData.endTime) {
                    this.banTimerInterval = setInterval(() => {
                        if (Date.now() >= banData.endTime) {
                            banRef.remove();
                            this.hideBanScreen();
                            clearInterval(this.banTimerInterval);
                        } else {
                            this.updateBanTimer(banData.endTime);
                        }
                    }, 1000);
                }
            } else {
                this.hideBanScreen();
            }
        });
    }
    
    async checkBanStatus() {
        const userId = localStorage.getItem('userId');
        if (!userId) return { isBanned: false };
        try {
            const snapshot = await firebase.database().ref('ban/' + userId).once('value');
            const banData = snapshot.val();
            if (banData && banData.active === true) {
                if (!banData.isPermanent && banData.endTime && banData.endTime < Date.now()) {
                    await firebase.database().ref('ban/' + userId).remove();
                    return { isBanned: false };
                }
                return { isBanned: true, reason: banData.reason || 'Нарушение правил', endTime: banData.endTime, isPermanent: banData.isPermanent };
            }
            return { isBanned: false };
        } catch (error) {
            console.error('Ошибка проверки бана:', error);
            return { isBanned: false };
        }
    }
    
    showBanScreen(reason, endTime, isPermanent) {
        const banOverlay = document.getElementById('banOverlay');
        const banReasonText = document.getElementById('banReasonText');
        const banTimerDisplay = document.getElementById('banTimerDisplay');
        if (!banOverlay) return;
        banReasonText.textContent = reason || 'Вы были забанены за нарушение правил';
        if (!isPermanent && endTime) {
            banTimerDisplay.style.display = 'block';
            this.updateBanTimer(endTime);
        } else {
            banTimerDisplay.style.display = 'none';
        }
        banOverlay.style.display = 'flex';
        document.querySelectorAll('.game-container, .glass-nav, .content, .click-btn').forEach(el => {
            if (el) el.style.pointerEvents = 'none';
        });
    }
    
    hideBanScreen() {
        const banOverlay = document.getElementById('banOverlay');
        if (banOverlay) banOverlay.style.display = 'none';
        document.querySelectorAll('.game-container, .glass-nav, .content, .click-btn').forEach(el => {
            if (el) el.style.pointerEvents = '';
        });
    }
    
    updateBanTimer(endTime) {
        const banTimerDisplay = document.getElementById('banTimerDisplay');
        if (!banTimerDisplay) return;
        const remaining = Math.max(0, endTime - Date.now());
        if (remaining <= 0) return;
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        if (days > 0) {
            banTimerDisplay.textContent = `Бан истекает через: ${days}д ${hours}ч ${minutes}м ${seconds}с`;
        } else {
            banTimerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    loadGlobalAnnouncements() {
        const container = document.getElementById('globalAnnouncements');
        if (!container) return;
        const getClosedAnnouncements = () => JSON.parse(localStorage.getItem('closedAnnouncements') || '[]');
        const saveClosedAnnouncements = (closed) => localStorage.setItem('closedAnnouncements', JSON.stringify(closed));
        this.announcementsRef = firebase.database().ref('announcements');
        this.announcementsRef.on('value', (snapshot) => {
            const announcements = snapshot.val();
            const closedAnnouncements = getClosedAnnouncements();
            if (!announcements) { container.innerHTML = ''; return; }
            const sorted = Object.entries(announcements).sort((a, b) => {
                if (a[1].isPinned && !b[1].isPinned) return -1;
                if (!a[1].isPinned && b[1].isPinned) return 1;
                return (b[1].timestamp || 0) - (a[1].timestamp || 0);
            });
            container.innerHTML = '';
            for (const [id, ann] of sorted) {
                if (closedAnnouncements.includes(id)) continue;
                const card = document.createElement('div');
                card.className = 'announcement-card liquid-glass';
                card.innerHTML = `<div class="announcement-text">${ann.text}<div class="announcement-date">${ann.date || ''}</div></div><button class="announcement-close liquid-glass" data-id="${id}">✕</button>`;
                const closeBtn = card.querySelector('.announcement-close');
                closeBtn.addEventListener('click', () => {
                    card.style.animation = 'announcementSlideDown 0.3s reverse';
                    setTimeout(() => card.remove(), 300);
                    const closed = getClosedAnnouncements();
                    closed.push(id);
                    saveClosedAnnouncements(closed);
                });
                container.appendChild(card);
            }
        });
    }
    
    initMaintenanceListener() {
        const maintRef = firebase.database().ref('maintenance');
        maintRef.on('value', (snapshot) => {
            const data = snapshot.val();
            const techWorkOverlay = document.getElementById('techWorkOverlay');
            const updateOverlay = document.getElementById('updateOverlay');
            const techWorkTimer = document.getElementById('techWorkTimer');
            const updateTimer = document.getElementById('updateTimer');
            const techWorkProgressBar = document.getElementById('techWorkProgressBar');
            const updateProgressBar = document.getElementById('updateProgressBar');
            if (!techWorkOverlay || !updateOverlay) return;
            if (this.maintenanceTimerInterval) clearInterval(this.maintenanceTimerInterval);
            techWorkOverlay.style.display = 'none';
            updateOverlay.style.display = 'none';
            if (data && data.active === true) {
                if (data.type === 'timer' && data.endTime) {
                    updateOverlay.style.display = 'flex';
                    const updateTimerDisplay = () => {
                        const remaining = Math.max(0, data.endTime - Date.now());
                        if (remaining <= 0) {
                            updateOverlay.style.display = 'none';
                            if (this.maintenanceTimerInterval) clearInterval(this.maintenanceTimerInterval);
                            return;
                        }
                        const totalSeconds = Math.floor(remaining / 1000);
                        const hours = Math.floor(totalSeconds / 3600);
                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                        const seconds = totalSeconds % 60;
                        if (updateTimer) {
                            updateTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            updateTimer.style.display = 'block';
                        }
                        if (updateProgressBar) {
                            const totalDuration = data.duration || 3600;
                            const progress = ((totalDuration - totalSeconds) / totalDuration) * 100;
                            updateProgressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
                        }
                    };
                    updateTimerDisplay();
                    this.maintenanceTimerInterval = setInterval(updateTimerDisplay, 1000);
                } else {
                    techWorkOverlay.style.display = 'flex';
                    if (data.endTime) {
                        if (techWorkTimer) techWorkTimer.style.display = 'block';
                        if (techWorkProgressBar) techWorkProgressBar.style.width = '100%';
                        const updateTechTimer = () => {
                            const remaining = Math.max(0, data.endTime - Date.now());
                            if (remaining <= 0) {
                                techWorkOverlay.style.display = 'none';
                                if (this.maintenanceTimerInterval) clearInterval(this.maintenanceTimerInterval);
                                return;
                            }
                            const totalSeconds = Math.floor(remaining / 1000);
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            const seconds = totalSeconds % 60;
                            if (techWorkTimer) techWorkTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            if (techWorkProgressBar) {
                                const totalDuration = data.duration || 3600;
                                const progress = ((totalDuration - totalSeconds) / totalDuration) * 100;
                                techWorkProgressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
                            }
                        };
                        updateTechTimer();
                        this.maintenanceTimerInterval = setInterval(updateTechTimer, 1000);
                    } else {
                        if (techWorkTimer) techWorkTimer.style.display = 'none';
                        if (techWorkProgressBar) techWorkProgressBar.style.width = '0%';
                    }
                }
            }
        });
    }
    
    checkPerformanceMode() {
        const isSlowDevice = () => {
            const ua = navigator.userAgent.toLowerCase();
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(ua);
            const memory = navigator.deviceMemory;
            const cores = navigator.hardwareConcurrency;
            // ВАЖНО: memory === undefined на iOS Safari и в старых браузерах.
            // Раньше `undefined < 4` давало false-срабатывание только случайно,
            // поэтому проверяем наличие значения явно.
            const lowMemory = typeof memory === 'number' && memory > 0 && memory < 4;
            const lowCores = typeof cores === 'number' && cores > 0 && cores < 4;
            return isMobile && (lowMemory || lowCores);
        };
        const performanceMode = this.userData.settings?.performanceMode || isSlowDevice();
        if (performanceMode) {
            document.body.classList.add('no-liquid-animations');
            if (this.userData.settings) this.userData.settings.performanceMode = true;
            this.saveGame();
        } else {
            document.body.classList.remove('no-liquid-animations');
        }
        const perfCheckbox = document.getElementById('performanceMode');
        if (perfCheckbox) {
            perfCheckbox.checked = performanceMode;
            perfCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.body.classList.add('no-liquid-animations');
                    this.userData.settings.performanceMode = true;
                    this.showToast('🎮 Режим экономии включен', 'success');
                } else {
                    document.body.classList.remove('no-liquid-animations');
                    this.userData.settings.performanceMode = false;
                    this.showToast('✨ Анимации включены', 'success');
                }
                this.saveGame();
            });
        }
    }
    
    async init() {
        const userId = localStorage.getItem('userId');
        const currentUser = localStorage.getItem('currentUser');
        if (!userId || !currentUser) { window.location.href = 'register.html'; return; }
        const banCheck = await this.checkBanStatus();
        if (banCheck.isBanned) this.showBanScreen(banCheck.reason, banCheck.endTime, banCheck.isPermanent);
        this.showLoader(true);
        try {
            const userRef = firebase.database().ref('users/' + userId);
            // Таймаут обязателен: если база не ответит, игрок раньше оставался
            // навсегда на экране «Загрузка...» с бесконечным спиннером.
            const snapshot = await this._withTimeout(userRef.once('value'), 15000);
            if (!snapshot || !snapshot.exists()) {
                this.showLoader(false);
                this.showToast('⚠️ Не удалось загрузить профиль. Обновите страницу', 'error');
                return;
            }
            if (snapshot.exists()) {
                this.userData = snapshot.val();
                if (this.userData.username !== currentUser) { localStorage.clear(); window.location.href = 'register.html'; return; }
                if (!this.userData.eventQuests) this.userData.eventQuests = { lastReset: 0, quests: [] };
                if (this.userData.eventContribution === undefined) this.userData.eventContribution = 0;
                if (!this.userData.wishlist) this.userData.wishlist = null;
                if (!this.userData.rechargeBonus) this.userData.rechargeBonus = 0;
                if (!this.userData.clickerMastery) this.userData.clickerMastery = 0;
                if (!this.userData.eventBooster) this.userData.eventBooster = 0;
                if (!this.userData.seasonClaimed) this.userData.seasonClaimed = { free: [], premium: [] };
                if (this.userData.seasonLevel > this.MAX_SEASON_LEVEL) this.userData.seasonLevel = this.MAX_SEASON_LEVEL;
                if (!this.userData.seasonLevel) this.userData.seasonLevel = 1;
                if (!this.userData.seasonExp) this.userData.seasonExp = 0;
                if (this.userData.settings === undefined) {
                    this.userData.settings = { displayName: this.userData.username, theme: 'dark', notifications: true, sound: true, animations: true, language: 'ru', performanceMode: false };
                }
                // Разовая миграция: сезон перезапускается для всех (150 → 50 уровней).
                // Нужна потому, что у игрока может быть открыта вкладка со старой
                // версией игры, и её автосохранение перезаписывает откат в базе.
                if (this.userData.seasonVersion !== this.SEASON_VERSION) this.applySeasonReset();
                this.checkAndResetQuests();
            } else {
                localStorage.clear();
                window.location.href = 'register.html';
                return;
            }
        } catch (error) {
            console.error(error);
            // Сетевой сбой — это НЕ повод стирать сессию и выкидывать на регистрацию
            // (раньше игрок терял вход из-за одного таймаута). Просим обновить страницу.
            this.showLoader(false);
            this.showToast('⚠️ Не удалось загрузить профиль. Обновите страницу', 'error');
            return;
        }
        this.loadElements();
        this.setupEventListeners();
        this.updateUI();
        this.updateInventory();
        this.updateShopStatus();
        this.renderUpgrades();
        if (this.clickIcon && this.userData.currentSkin) this.clickIcon.src = this.skinsData[this.userData.currentSkin].image;
        this.checkIfCreator();
        this.settings = new Settings(this);
        this.checkPerformanceMode();
        setTimeout(async () => {
            await this.checkCompensation();
            this.startAutoClicker();
            this.startPlaytimeTracker();
            this.startBubbles();
            this.updatePromocodesList();
            this.updatePromocodesHistory();
            this.updateLeaderboard('clicks');
            this.initEventsPage();
            this.initUraganEvent();
            this.loadGlobalAnnouncements();
            this.initBanListener();
            this.initMaintenanceListener();
            this.startQuestRefreshTimer();
            this.updateSeasonUI();
            this.initSeasonScroll();
            this.isLoaded = true;
            this.showLoader(false);
            // Если был перезапуск сезона — записываем его в базу сразу, чтобы
            // старой вкладке было нечем перезаписать откат
            if (this._forceSaveOnce) { this._forceSaveOnce = false; this.flushSaveNow(); }
            this._invalidateRects();   // layout после старта мог сместиться
        }, 100);
    }

    // ===== РАЗОВЫЙ ПЕРЕЗАПУСК СЕЗОНА =====
    // Сезон ужат со 150 до MAX_SEASON_LEVEL уровней. Возвращаем всех в начало:
    // уровень, опыт и собранные награды обнуляются, а сезонные скины
    // (ДИЛИК МАСТЕР / ЛОРД / КОРОЛЬ) изымаются — их выдавали только за уровни
    // сезона, так что раньше 25/40/50 уровня их получить нельзя.
    // НЕ трогает: дилики, монеты, премиум-пропуск, клики, обычные скины,
    // достижения, промокоды и прогресс ивентов.
    applySeasonReset() {
        if (!this.userData) return;
        const SEASON_SKINS = ['uragan_dragon_top3', 'uragan_holo_top10', 'uragan_banana_top50'];

        this.userData.seasonLevel = 1;
        this.userData.seasonExp = 0;
        this.userData.seasonClaimed = { free: [], premium: [] };

        // Забираем только сезонные скины, остальные не трогаем
        if (Array.isArray(this.userData.inventory)) {
            this.userData.inventory = this.userData.inventory.filter(s => !SEASON_SKINS.includes(s));
        } else {
            this.userData.inventory = ['classic'];
        }
        // Если был надет сезонный скин — возвращаем классический
        if (SEASON_SKINS.includes(this.userData.currentSkin)) {
            this.userData.currentSkin = 'classic';
            if (this.clickIcon) this.clickIcon.src = this.skinsData.classic.image;
        }

        this.userData.seasonVersion = this.SEASON_VERSION;
        this._savePending = true;        // изменения ждут записи в базу
        this._forceSaveOnce = true;      // пишем в базу сразу после загрузки
        this._tiersRaceKey = null;       // лента перерисуется под новый уровень
        this._uiCache = {};              // сбрасываем кэш цифр интерфейса
    }
    
    loadElements() {
        this.usernameDisplay = document.getElementById('usernameDisplay');
        this.moneySpan = document.getElementById('money');
        this.dilicksSpan = document.getElementById('dilicks');
        this.clicksSpan = document.getElementById('clicks');
        this.clickPowerSpan = document.getElementById('clickPower');
        this.playtimeSpan = document.getElementById('playtime');
        this.clickButton = document.getElementById('clickButton');
        this.clickIcon = document.getElementById('clickIcon');
        this.clickEffects = document.getElementById('clickEffects');
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.tabs = document.querySelectorAll('.tab');
        this.buyBtns = document.querySelectorAll('.buy-btn');
        this.seasonProgress = document.getElementById('seasonProgress');
        this.seasonLevel = document.getElementById('seasonLevel');
        this.buyPremiumBtn = document.getElementById('buyPremiumBtn');
        this.leaderboardBtns = document.querySelectorAll('[data-leaderboard]');
        this.leaderboardBody = document.getElementById('leaderboardBody');
        this.inventoryGrid = document.getElementById('inventoryGrid');
        this.profileUsername = document.getElementById('profileUsername');
        this.profileLevel = document.getElementById('profileLevel');
        this.profileClicks = document.getElementById('profileClicks');
        this.profileMoney = document.getElementById('profileMoney');
        this.profileDilicks = document.getElementById('profileDilicks');
        this.profilePlaytime = document.getElementById('profilePlaytime');
        this.profileAvatar = document.getElementById('profileAvatar');
        this.achievementsGrid = document.getElementById('achievementsGrid');
        this.ownedSkinsList = document.getElementById('ownedSkinsList');
        this.skinProgressFill = document.getElementById('skinProgressFill');
        this.ownedSkins = document.getElementById('ownedSkins');
        this.totalSkins = document.getElementById('totalSkins');
        this.promocodeInput = document.getElementById('promocodeInput');
        this.activatePromocodeBtn = document.getElementById('activatePromocodeBtn');
        this.promocodeMessage = document.getElementById('promocodeMessage');
        this.promocodesList = document.getElementById('promocodesList');
        this.promocodesHistory = document.getElementById('promocodesHistory');
        this.navToggleBtn = document.getElementById('navToggleBtn');
        this.navLinks = document.querySelector('.nav-links');
        this.upgradesGrid = document.getElementById('upgradesGrid');
        this.moneyCurrencyBtn = document.getElementById('moneyCurrencyBtn');
        this.dilicksCurrencyBtn = document.getElementById('dilicksCurrencyBtn');
        this.exchangeModal = document.getElementById('exchangeModal');
        this.exchangeCloseBtn = document.getElementById('exchangeCloseBtn');
        this.exchangeTitle = document.getElementById('exchangeTitle');
        this.exchangeRate = document.getElementById('exchangeRate');
        this.exchangeDirection = document.getElementById('exchangeDirection');
        this.exchangeInput = document.getElementById('exchangeInput');
        this.exchangeResultValue = document.getElementById('exchangeResultValue');
        this.exchangeBalanceFrom = document.getElementById('exchangeBalanceFrom');
        this.exchangeConfirmBtn = document.getElementById('exchangeConfirmBtn');
        this.exchangeInputLabel = document.getElementById('exchangeInputLabel');
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    }
    
    setupEventListeners() {
        // Сброс кэша позиций эффектов: положение кликера меняется при скролле/повороте
        window.addEventListener('resize', () => this._invalidateRects(), { passive: true });
        window.addEventListener('orientationchange', () => this._invalidateRects(), { passive: true });
        window.addEventListener('scroll', () => this._invalidateRects(), { passive: true });
        this.navBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); this.switchTab(btn.dataset.tab); }));
        if (this.clickButton) this.clickButton.addEventListener('click', (e) => { e.preventDefault(); this.handleClick(e); });
        if (this.buyPremiumBtn) this.buyPremiumBtn.addEventListener('click', (e) => { e.preventDefault(); this.buyPremiumPass(); });
        if (this.activatePromocodeBtn) this.activatePromocodeBtn.addEventListener('click', (e) => { e.preventDefault(); this.activatePromocode(); });
        if (this.promocodeInput) this.promocodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.activatePromocode(); });
        if (this.navToggleBtn) {
            this.navToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navLinks.classList.toggle('hidden');
                const icon = this.navToggleBtn.querySelector('.toggle-icon');
                icon.textContent = this.navLinks.classList.contains('hidden') ? '▶' : '◀';
            });
        }
        this.leaderboardBtns.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.leaderboardBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.updateLeaderboard(btn.dataset.leaderboard);
        }));
        this.buyBtns.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (btn.disabled || btn.classList.contains('disabled')) return;
            this.buyItem(btn.dataset.item, parseInt(btn.dataset.price));
        }));
        if (this.moneyCurrencyBtn) this.moneyCurrencyBtn.addEventListener('click', () => this.openExchange('money'));
        if (this.dilicksCurrencyBtn) this.dilicksCurrencyBtn.addEventListener('click', () => this.openExchange('dilicks'));
        if (this.exchangeCloseBtn) this.exchangeCloseBtn.addEventListener('click', () => this.closeExchange());
        if (this.exchangeModal) this.exchangeModal.addEventListener('click', (e) => { if (e.target === this.exchangeModal) this.closeExchange(); });
        if (this.exchangeInput) this.exchangeInput.addEventListener('input', () => this.updateExchangePreview());
        document.querySelectorAll('.exchange-quick-btn').forEach(btn => btn.addEventListener('click', () => {
            const quick = btn.dataset.quick;
            if (quick === 'max') this.exchangeInput.value = this.exchangeFrom === 'money' ? this.userData.money : this.userData.dilicks;
            else this.exchangeInput.value = quick;
            this.updateExchangePreview();
        }));
        if (this.exchangeConfirmBtn) this.exchangeConfirmBtn.addEventListener('click', () => this.confirmExchange());
        
        const buyLevelBtn = document.getElementById('buyLevelBtn');
        if (buyLevelBtn) buyLevelBtn.addEventListener('click', (e) => { e.preventDefault(); this.openBuyLevelsModal(); });
        const buyLevelsCloseBtn = document.getElementById('buyLevelsCloseBtn');
        if (buyLevelsCloseBtn) buyLevelsCloseBtn.addEventListener('click', () => this.closeBuyLevelsModal());
        const buyLevelsModal = document.getElementById('buyLevelsModal');
        if (buyLevelsModal) buyLevelsModal.addEventListener('click', (e) => { if (e.target === buyLevelsModal) this.closeBuyLevelsModal(); });
        document.querySelectorAll('.buy-level-card').forEach(card => {
            card.addEventListener('click', () => this.buySeasonLevels(parseInt(card.dataset.levels)));
        });
        
        const claimAllBtn = document.getElementById('claimAllBtn');
        if (claimAllBtn) claimAllBtn.addEventListener('click', () => this.claimAllSeasonRewards());
    }
    
    switchTab(tabId) {
        this.navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        this.tabs.forEach(tab => tab.classList.toggle('active', tab.id === tabId));
        if (tabId === 'inventory') this.updateInventory();
        if (tabId === 'upgrades') this.renderUpgrades();
        if (tabId === 'profile') this.updateProfile();
        if (tabId === 'settings' && this.settings) this.settings.updateUI();
        if (tabId === 'promocodes') { this.updatePromocodesList(); this.updatePromocodesHistory(); }
        if (tabId === 'season') {
            this.updateSeasonUI();
            if (this._seasonAutoScrollFrame) cancelAnimationFrame(this._seasonAutoScrollFrame);
            this._seasonAutoScrollFrame = requestAnimationFrame(() => {
                const sc = document.getElementById('seasonTrackScroll');
                const cur = document.querySelector('.season-tier-column.current');
                if (!sc || !cur) return;
                sc.scrollLeft = Math.max(0, cur.offsetLeft - (sc.clientWidth / 2) + (cur.clientWidth / 2));
                this._seasonAutoScrollFrame = null;
            });
            setTimeout(() => this.updateScrollButtons(), 200);
        }
        if (tabId === 'leaderboard') {
            const activeTab = document.querySelector('.leaderboard-tabs .active');
            this.updateLeaderboard(activeTab ? activeTab.dataset.leaderboard : 'clicks');
        }
        if (tabId === 'events') this.showEventsList();
        this._invalidateRects();
    }

    // ===== СЕЗОННЫЙ ПРОПУСК (MAX_SEASON_LEVEL УРОВНЕЙ) =====
    getSeasonExpNeeded(level) {
        if (level <= 10) return 100 + (level - 1) * 50;
        if (level <= 50) return 600 + (level - 11) * 46;
        return 2550 + (level - 51) * 49;
    }

    // Начисление XP. Раньше здесь вызывался updateSeasonUI(), который перерисовывал
    // всю ленту из 150 уровней (600+ узлов и 450 картинок) НА КАЖДЫЙ КЛИК — это и был    // главный источник лагов. Теперь обновляется только прогресс-бар (троттлинг через rAF),
    // а лента трогается лишь тогда, когда реально меняется уровень.
    addSeasonExp(amount) {
        this._applySeasonExp(Math.max(1, Math.floor(amount / 100)));
    }

    // Пакетное начисление XP (автокликер): считаем один раз, в DOM пишем один раз
    addSeasonExpBatch(totalAmount) {
        if (!this.userData || totalAmount <= 0) return;
        this._applySeasonExp(Math.max(1, Math.floor(totalAmount / 100)));
    }

    _applySeasonExp(xpGain) {
        if (!this.userData) return;
        this.userData.seasonExp = (this.userData.seasonExp || 0) + xpGain;
        let leveledUp = false;
        while (this.userData.seasonLevel < this.MAX_SEASON_LEVEL) {
            const expNeeded = this.getSeasonExpNeeded(this.userData.seasonLevel);
            if (this.userData.seasonExp >= expNeeded) {
                this.userData.seasonExp -= expNeeded;
                this.userData.seasonLevel++;
                leveledUp = true;
            } else break;
        }
        if (this.userData.seasonLevel >= this.MAX_SEASON_LEVEL) this.userData.seasonExp = 0;
        this.scheduleSeasonBarSync();
        if (leveledUp) {
            this._tiersStateKey = null;      // уровень изменился — лента обновится один раз
            this._tiersRaceKey = null;
            this._uiCache.seasonLevel = null;
            this.saveGame();
            this.showToast(`🎫 Новый уровень сезонного пропуска: ${this.userData.seasonLevel}!`, 'success');
        }
    }

    // Лёгкая синхронизация прогресс-бара: не чаще одного раза на кадр
    scheduleSeasonBarSync() {
        if (this._seasonBarFrame) return;
        const run = () => {
            this._seasonBarFrame = null;
            this.syncSeasonBar();
        };
        if (typeof requestAnimationFrame === 'function') this._seasonBarFrame = requestAnimationFrame(run);
        else run();
    }

    syncSeasonBar() {
        if (!this.userData) return;
        const level = this.userData.seasonLevel || 1;
        const exp = this.userData.seasonExp || 0;
        const maxLevel = this.MAX_SEASON_LEVEL;
        const isMax = level >= maxLevel;
        const expNeeded = isMax ? 1 : this.getSeasonExpNeeded(level);
        const progress = isMax ? 100 : Math.min(100, (exp / expNeeded) * 100);

        if (this.seasonProgress) this.seasonProgress.style.width = progress + '%';
        if (this.seasonLevel && this._uiCache.seasonLevel !== level) {
            this.seasonLevel.textContent = level;
            this._uiCache.seasonLevel = level;
        }
        const seasonExpTextEl = document.getElementById('seasonExpText');
        if (seasonExpTextEl) {
            const text = isMax ? 'МАКСИМУМ' : `${this.formatNumber(exp)} / ${this.formatNumber(expNeeded)} XP`;
            if (this._uiCache.seasonExpText !== text) {
                seasonExpTextEl.textContent = text;
                this._uiCache.seasonExpText = text;
            }
        }
    }

    // Полное обновление сезонной вкладки (шапка + лента). Вызывается только при
    // открытии вкладки «Сезон» и после покупок/получения наград — НЕ в цикле клика.
    updateSeasonUI() {
        this.syncSeasonBar();

        const level = this.userData.seasonLevel || 1;
        const premiumBtnTextEl = document.getElementById('premiumBtnText');
        const buyPremiumBtn = document.getElementById('buyPremiumBtn');
        const buyLevelBtn = document.getElementById('buyLevelBtn');
        const buyLevelTextEl = document.getElementById('buyLevelText');
        const buyLevelsBalanceEl = document.getElementById('buyLevelsBalance');
        const cache = this._uiCache;

        // Покупка премиума / уровней: пишем в DOM только при реальном изменении
        const premiumKey = 'premium:' + (this.userData.premiumPass ? '1' : '0');
        if (buyPremiumBtn && premiumBtnTextEl && cache.premiumBtn !== premiumKey) {
            if (this.userData.premiumPass) {
                buyPremiumBtn.classList.add('active');
                buyPremiumBtn.disabled = true;
                premiumBtnTextEl.textContent = '✅ ПРЕМИУМ АКТИВЕН';
            } else {
                buyPremiumBtn.classList.remove('active');
                buyPremiumBtn.disabled = false;
                premiumBtnTextEl.innerHTML = `${this.getDilicksIcon()} КУПИТЬ ПРЕМИУМ — 15000`;
            }
            cache.premiumBtn = premiumKey;
        }

        const levelKey = level >= this.MAX_SEASON_LEVEL ? 'max' : 'buy';
        if (buyLevelBtn && buyLevelTextEl && cache.buyLevelBtn !== levelKey) {
            if (level >= this.MAX_SEASON_LEVEL) {
                buyLevelBtn.disabled = true;
                buyLevelTextEl.textContent = '🏆 МАКС. УРОВЕНЬ';
            } else {
                buyLevelBtn.disabled = false;
                buyLevelTextEl.textContent = '⬆️ КУПИТЬ УРОВНИ';
            }
            cache.buyLevelBtn = levelKey;
        }

        if (buyLevelsBalanceEl) {
            const balKey = this.userData.dilicks || 0;
            if (cache.buyLevelsBalance !== balKey) {
                buyLevelsBalanceEl.textContent = this.formatNumber(balKey);
                cache.buyLevelsBalance = balKey;
            }
        }

        const claimAllBtn = document.getElementById('claimAllBtn');
        if (claimAllBtn) {
            const hasClaimable = this.hasClaimableSeasonRewards();
            if (cache.claimAll !== hasClaimable) {
                claimAllBtn.disabled = !hasClaimable;
                claimAllBtn.textContent = hasClaimable ? '🎁 СОБРАТЬ ВСЁ' : '✅ ВСЁ СОБРАНО';
                cache.claimAll = hasClaimable;
            }
        }

        this.renderSeasonTiers();
    }
    
    hasClaimableSeasonRewards() {
        const level = this.userData.seasonLevel || 1;
        const premium = this.userData.premiumPass || false;
        const claimed = this.userData.seasonClaimed || { free: [], premium: [] };
        // Set вместо includes() внутри цикла: было O(n²) на каждый вызов
        const claimedFree = new Set(claimed.free || []);
        const claimedPremium = new Set(claimed.premium || []);
        for (let lvl = 1; lvl <= level; lvl++) {
            if (!claimedFree.has(lvl)) return true;
            if (premium && !claimedPremium.has(lvl)) return true;
        }
        return false;
    }

    // Быстрый кэшированный формат чисел (toLocaleString в цикле клика — дорого).
    // Локаль не задаём жёстко — формат остаётся ровно таким, как был.
    formatNumber(value) {
        const num = Number(value) || 0;
        if (this._numberFormatter === undefined) {
            try { this._numberFormatter = new Intl.NumberFormat(); }
            catch (e) { this._numberFormatter = null; }
        }
        if (this._numberFormatter) return this._numberFormatter.format(num);
        return num.toLocaleString();
    }
    
    async claimAllSeasonRewards() {
        const level = this.userData.seasonLevel || 1;
        const premium = this.userData.premiumPass || false;
        if (!this.userData.seasonClaimed) this.userData.seasonClaimed = { free: [], premium: [] };
        
        let claimedCount = 0;
        let totalMoney = 0;
        let totalDilicks = 0;
        let newSkins = [];
        
        for (let lvl = 1; lvl <= level; lvl++) {
            if (!this.userData.seasonClaimed.free.includes(lvl)) {
                const r = this.getSeasonReward(lvl, false);
                if (r.type === 'money') { this.userData.money += r.value; totalMoney += r.value; }
                else if (r.type === 'dilicks') { this.userData.dilicks += r.value; totalDilicks += r.value; }
                else if (r.type === 'skin') {
                    if (!this.userData.inventory.includes(r.skinId)) { this.userData.inventory.push(r.skinId); newSkins.push(r.name); }
                    else { this.userData.dilicks += 1000; totalDilicks += 1000; }
                }
                this.userData.seasonClaimed.free.push(lvl);
                claimedCount++;
            }
            
            if (premium && !this.userData.seasonClaimed.premium.includes(lvl)) {
                const r = this.getSeasonReward(lvl, true);
                if (r.type === 'money') { this.userData.money += r.value; totalMoney += r.value; }
                else if (r.type === 'dilicks') { this.userData.dilicks += r.value; totalDilicks += r.value; }
                else if (r.type === 'skin') {
                    if (!this.userData.inventory.includes(r.skinId)) { this.userData.inventory.push(r.skinId); newSkins.push(r.name); }
                    else { this.userData.dilicks += 1000; totalDilicks += 1000; }
                }
                this.userData.seasonClaimed.premium.push(lvl);
                claimedCount++;
            }
        }
        
        if (claimedCount === 0) {
            this.showToast('⚠️ Нечего собирать', 'warning');
            return;
        }
        
        this.showClaimAllAnimation(claimedCount, totalMoney, totalDilicks, newSkins);
        this.updateUI();
        this.updateInventory();
        this.updateShopStatus();
        this.updateSeasonUI();
        await this.saveGame();
        this.checkAchievements();
    }
    
    showClaimAllAnimation(count, money, dilicks, skins) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at center,rgba(255,215,0,0.2),rgba(0,0,0,0.9));backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;opacity:0;transition:opacity 0.4s ease;pointer-events:none;padding:20px;';
        const title = document.createElement('div');
        title.textContent = '🎁 ПОЛУЧЕНО!';
        title.style.cssText = 'font-size:2.5rem;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff8800,#ffd700);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 40px rgba(255,215,0,0.6);opacity:0;transform:translateY(30px) scale(0.8);transition:all 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);text-align:center;';
        const countText = document.createElement('div');
        countText.textContent = `${count} НАГРАД`;
        countText.style.cssText = 'font-size:2rem;font-weight:800;color:gold;text-shadow:0 0 20px gold;opacity:0;transition:opacity 0.5s ease 0.3s;';
        const rewardsBox = document.createElement('div');
        rewardsBox.style.cssText = 'display:flex;flex-direction:column;gap:12px;background:rgba(20,25,35,0.95);border:2px solid gold;border-radius:30px;padding:25px 35px;opacity:0;transform:scale(0.8);transition:all 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) 0.5s;box-shadow:0 0 40px rgba(255,215,0,0.4);max-height:60vh;overflow-y:auto;';
        let rewardsHtml = '';
        // Эмодзи-мешочек и алмазик убраны: остаётся своя иконка валюты игры
        if (money > 0) rewardsHtml += `<div style="display:flex;align-items:center;gap:10px;color:white;font-size:1.3rem;font-weight:700;">+${money.toLocaleString()} <img src="${this.MONEY_ICON}" style="width:24px;height:24px;border-radius:50%;"></div>`;
        if (dilicks > 0) rewardsHtml += `<div style="display:flex;align-items:center;gap:10px;color:white;font-size:1.3rem;font-weight:700;">+${dilicks.toLocaleString()} <img src="${this.DILICKS_ICON}" style="width:24px;height:24px;border-radius:50%;"></div>`;
        if (skins.length > 0) {
            rewardsHtml += `<div style="color:gold;font-size:1rem;font-weight:700;margin-top:5px;">✨ Новые скины:</div>`;
            skins.forEach(s => { rewardsHtml += `<div style="color:white;font-size:0.95rem;font-weight:600;">• ${s}</div>`; });
        }
        rewardsBox.innerHTML = rewardsHtml;
        overlay.appendChild(title);
        overlay.appendChild(countText);
        overlay.appendChild(rewardsBox);
        document.body.appendChild(overlay);
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            const s = Math.random() * 8 + 3;
            p.style.cssText = `position:absolute;width:${s}px;height:${s}px;background:radial-gradient(circle,gold,transparent);border-radius:50%;top:50%;left:50%;box-shadow:0 0 12px gold;pointer-events:none;transition:all ${1.5+Math.random()*1.5}s cubic-bezier(0.68,-0.55,0.265,1.55);opacity:1;`;
            overlay.appendChild(p);
            const a = (Math.PI * 2 * i) / 50 + Math.random() * 0.5;
            const d = 150 + Math.random() * 400;
            setTimeout(() => { p.style.transform = `translate(${Math.cos(a)*d}px, ${Math.sin(a)*d}px) scale(0)`; p.style.opacity = '0'; }, 100);
        }
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            setTimeout(() => { title.style.opacity = '1'; title.style.transform = 'translateY(0) scale(1)'; }, 200);
            setTimeout(() => { countText.style.opacity = '1'; }, 500);
            setTimeout(() => { rewardsBox.style.opacity = '1'; rewardsBox.style.transform = 'scale(1)'; if (navigator.vibrate) navigator.vibrate([50,50,100]); }, 800);
        });
        setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 500); }, 4500);
    }

    // ===== НАГРАДЫ СЕЗОНА =====
    // Сезон сокращён со 150 до MAX_SEASON_LEVEL (50) уровней, поэтому редкие
    // премиум-скины перенесены на достижимые уровни:
    //   ДИЛИК МАСТЕР (×55)  — 25 уровень
    //   ДИЛИК ЛОРД   (×100) — 40 уровень
    //   ДИЛИК КОРОЛЬ (×145) — 50 уровень, главная награда сезона
    getSeasonReward(level, isPremium) {
        const maxLevel = this.MAX_SEASON_LEVEL;
        if (isPremium) {
            if (level >= maxLevel) return { type: 'skin', skinId: 'uragan_dragon_top3', name: 'ДИЛИК КОРОЛЬ' };
            if (level === 40) return { type: 'skin', skinId: 'uragan_holo_top10', name: 'ДИЛИК ЛОРД' };
            if (level === 25) return { type: 'skin', skinId: 'uragan_banana_top50', name: 'ДИЛИК МАСТЕР' };
            if (level % 15 === 0) return { type: 'dilicks', value: 10000 };
            if (level % 5 === 0) return { type: 'dilicks', value: 2500 };
            if (level % 3 === 0) return { type: 'dilicks', value: 500 };
            if (level === 5) return { type: 'dilicks', value: 1500 };
            if (level === 20) return { type: 'dilicks', value: 2000 };
            if (level % 2 === 0) return { type: 'money', value: 15000 };
            return { type: 'money', value: 7500 };
        } else {
            if (level >= maxLevel) return { type: 'dilicks', value: 25000 };
            if (level === 40) return { type: 'dilicks', value: 10000 };
            if (level === 25) return { type: 'dilicks', value: 2500 };
            if (level % 15 === 0) return { type: 'dilicks', value: 1500 };
            if (level % 5 === 0) return { type: 'dilicks', value: 200 };
            if (level % 3 === 0) return { type: 'money', value: 3000 };
            return { type: 'money', value: 800 };
        }
    }

    // ===== ЛЕНТА СЕЗОНА: инкрементальный рендер =====
    // Было: на каждый вызов innerHTML = '' и создание 150 колонок = 600+ узлов,
    // 300 кнопок со своими слушателями и 450 <img> с внешних CDN. Обновление
    // состояния теперь меняет только атрибуты у уже созданных узлов, картинки
    // больше не перезагружаются, а кнопки «ЗАБРАТЬ» обрабатываются делегированием.
    renderSeasonTiers() {
        const container = document.getElementById('seasonTrack');
        if (!container) return;

        // Ленту из 150 колонок строим не во время старта игры (когда грузится интерфейс
        // и профиль), а когда браузер свободен и вкладка «Сезон» реально показана.
        const seasonTab = document.getElementById('season');
        const tabVisible = !!seasonTab && seasonTab.classList.contains('active');
        if (!this._tiersRendered && !tabVisible) {
            if (!this._tiersDeferScheduled) {
                this._tiersDeferScheduled = true;
                // Собираем напрямую, без повторного входа в renderSeasonTiers
                const build = () => {
                    this._tiersDeferScheduled = false;
                    if (this._tiersRendered) return;
                    const c = document.getElementById('seasonTrack');
                    if (!c || !this.userData) return;
                    const level = this.userData.seasonLevel || 1;
                    const prem = this.userData.premiumPass || false;
                    const free = new Set((this.userData.seasonClaimed && this.userData.seasonClaimed.free) || []);
                    const premClaimed = new Set((this.userData.seasonClaimed && this.userData.seasonClaimed.premium) || []);
                    this._buildSeasonTiers(c, level, prem, free, premClaimed);
                    const raceKey = level + ':' + (prem ? 1 : 0) + ':' + free.size + ':' + premClaimed.size;
                    this._tiersRaceKey = raceKey;
                    this.updateScrollButtons();
                };
                if (typeof requestIdleCallback === 'function') requestIdleCallback(build, { timeout: 1500 });
                else setTimeout(build, 300);
            }
            return;
        }

        const currentLevel = this.userData.seasonLevel || 1;
        const premium = this.userData.premiumPass || false;
        const claimedFree = new Set((this.userData.seasonClaimed && this.userData.seasonClaimed.free) || []);
        const claimedPremium = new Set((this.userData.seasonClaimed && this.userData.seasonClaimed.premium) || []);

        // Если с прошлого рендера ничего не изменилось — вообще не трогаем DOM
        const raceKey = currentLevel + ':' + (premium ? 1 : 0) + ':' + claimedFree.size + ':' + claimedPremium.size;
        if (this._tiersRendered && this._tiersRaceKey === raceKey) return;
        this._tiersRaceKey = raceKey;

        // Если сменилось только состояние (уровень/награды) — обновляем атрибуты,
        // не трогая структуру. Полная сборка нужна один раз.
        const maxLevel = this.MAX_SEASON_LEVEL;
        if (this._tiersCache && this._tiersCache.count === maxLevel) {
            for (let level = 1; level <= maxLevel; level++) {
                const entry = this._tiersCache.columns[level - 1];
                if (!entry) continue;
                this.updateTierColumn(entry, level, currentLevel, premium, claimedFree, claimedPremium);
            }
            setTimeout(() => this.updateScrollButtons(), 100);
            return;
        }

        this._buildSeasonTiers(container, currentLevel, premium, claimedFree, claimedPremium);
        setTimeout(() => this.updateScrollButtons(), 100);
    }

    _buildSeasonTiers(container, currentLevel, premium, claimedFree, claimedPremium) {
        // 1) вся разметка собирается в фрагменте (одна вставка в DOM)
        const frag = document.createDocumentFragment();
        const columns = [];
        const maxLevel = this.MAX_SEASON_LEVEL;

        for (let level = 1; level <= maxLevel; level++) {
            const column = document.createElement('div');
            column.dataset.level = level;

            const badge = document.createElement('div');
            badge.className = 'season-tier-badge';
            badge.textContent = level;
            column.appendChild(badge);

            const premCell = document.createElement('div');
            premCell.dataset.premium = '1';
            const premContent = this.createRewardContent(this.getSeasonReward(level, true));
            premCell.appendChild(premContent.el);
            const premStatus = document.createElement('span');
            premStatus.className = 'season-tier-status';
            const premBtn = document.createElement('button');
            premBtn.type = 'button';
            premBtn.className = 'season-tier-claim-btn';
            premBtn.textContent = 'ЗАБРАТЬ';
            premBtn.dataset.level = level;
            premBtn.dataset.tier = 'premium';
            premBtn.hidden = true;
            premCell.appendChild(premStatus);
            premCell.appendChild(premBtn);
            column.appendChild(premCell);

            const freeCell = document.createElement('div');
            freeCell.dataset.premium = '0';
            const freeContent = this.createRewardContent(this.getSeasonReward(level, false));
            freeCell.appendChild(freeContent.el);
            const freeStatus = document.createElement('span');
            freeStatus.className = 'season-tier-status';
            const freeBtn = document.createElement('button');
            freeBtn.type = 'button';
            freeBtn.className = 'season-tier-claim-btn';
            freeBtn.textContent = 'ЗАБРАТЬ';
            freeBtn.dataset.level = level;
            freeBtn.dataset.tier = 'free';
            freeBtn.hidden = true;
            freeCell.appendChild(freeStatus);
            freeCell.appendChild(freeBtn);
            column.appendChild(freeCell);

            const entry = {
                column: column,
                badge: badge,
                premium: { cell: premCell, status: premStatus, btn: premBtn, content: premContent },
                free: { cell: freeCell, status: freeStatus, btn: freeBtn, content: freeContent }
            };
            columns.push(entry);
            frag.appendChild(column);
        }

        // 2) наполняем состояниями до вставки в DOM
        for (let level = 1; level <= maxLevel; level++) {
            this.updateTierColumn(columns[level - 1], level, currentLevel, premium, claimedFree, claimedPremium);
        }

        // 3) одна вставка вместо сотен appendChild
        container.innerHTML = '';
        container.appendChild(frag);

        // 4) делегирование клика: один слушатель вместо 300
        if (this._tiersClickHandler) container.removeEventListener('click', this._tiersClickHandler);
        this._tiersClickHandler = (e) => {
            const btn = e.target.closest ? e.target.closest('.season-tier-claim-btn') : null;
            if (!btn || btn.hidden) return;
            e.preventDefault();
            e.stopPropagation();
            this.claimSeasonReward(parseInt(btn.dataset.level, 10), btn.dataset.tier === 'premium');
        };
        container.addEventListener('click', this._tiersClickHandler);

        this._tiersCache = { count: maxLevel, columns: columns };
        this._tiersRendered = true;
    }

    updateTierColumn(entry, level, currentLevel, premium, claimedFree, claimedPremium) {
        if (!entry) return;
        const isCurrent = level === currentLevel;
        const isUnlocked = level <= currentLevel;

        const columnClass = 'season-tier-column' + (isCurrent ? ' current' : '') + (isUnlocked ? ' unlocked' : '');
        if (entry.column.className !== columnClass) entry.column.className = columnClass;

        this._updateTierCell(entry.premium, level, true, premium && isUnlocked, claimedPremium.has(level), premium);
        this._updateTierCell(entry.free, level, false, isUnlocked, claimedFree.has(level), premium);
    }

    _updateTierCell(cell, level, isPremium, unlocked, claimed, hasPremiumPass) {
        const cls = 'season-tier-cell'
            + (isPremium ? ' premium' : '')
            + (unlocked ? ' unlocked' : '')
            + (claimed ? ' claimed' : '')
            + (!unlocked && !claimed ? ' locked' : '');
        if (cell.cell.className !== cls) cell.cell.className = cls;

        // Значок статуса / кнопка получения (внешний вид как был: ✅ / ЗАБРАТЬ / 👑 или 🔒)
        if (claimed) {
            if (cell.status.textContent !== '✅') cell.status.textContent = '✅';
            if (cell.status.className !== 'season-tier-status claimed-mark') cell.status.className = 'season-tier-status claimed-mark';
            if (cell.status.hidden) cell.status.hidden = false;
            if (!cell.btn.hidden) cell.btn.hidden = true;
        } else if (unlocked) {
            if (!cell.status.hidden) cell.status.hidden = true;
            if (cell.btn.hidden) cell.btn.hidden = false;
        } else {
            const glyph = (isPremium && !hasPremiumPass) ? '👑' : '🔒';
            if (cell.status.textContent !== glyph) cell.status.textContent = glyph;
            if (cell.status.className !== 'season-tier-status locked-mark') cell.status.className = 'season-tier-status locked-mark';
            if (cell.status.hidden) cell.status.hidden = false;
            if (!cell.btn.hidden) cell.btn.hidden = true;
        }

        const reward = this.getSeasonReward(level, isPremium);
        this.applyRewardContent(cell.content, reward);
    }

    // Разметка награды создаётся ОДИН раз. Раньше innerHTML со <img> заставлял
    // браузер заново скачивать/декодировать 450 картинок на каждую перерисовку.
    createRewardContent(reward) {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'center';
        el.style.gap = '4px';

        let img = null;
        let text = null;
        if (reward.type === 'money' || reward.type === 'dilicks') {
            img = document.createElement('img');
            img.className = 'season-tier-icon';
            img.src = reward.type === 'money' ? this.MONEY_ICON : this.DILICKS_ICON;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.draggable = false;
            text = document.createElement('div');
            text.className = 'season-tier-value';
            el.appendChild(img);
            el.appendChild(text);
        } else if (reward.type === 'skin') {
            const skin = this.skinsData[reward.skinId];
            img = document.createElement('img');
            img.className = 'season-tier-icon';
            img.src = skin ? skin.image : this.DILICKS_ICON;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.draggable = false;
            text = document.createElement('div');
            text.className = 'season-tier-name';
            text.textContent = reward.name;
            el.appendChild(img);
            el.appendChild(text);
        }
        const content = { el: el, img: img, text: text, sig: null };
        return content;
    }

    applyRewardContent(content, reward) {
        if (!content || !content.text) return;
        let valueText = '';
        if (reward.type === 'money' || reward.type === 'dilicks') valueText = this.formatNumber(reward.value);
        else if (reward.type === 'skin') valueText = reward.name || '';

        // signature: если содержимое не изменилось — не трогаем DOM вообще
        const sig = reward.type + ':' + valueText;
        if (content.sig === sig) return;
        content.sig = sig;
        if (content.text.textContent !== valueText) content.text.textContent = valueText;
    }

    async claimSeasonReward(level, isPremium) {
        if (level > (this.userData.seasonLevel || 1)) return;
        if (isPremium && !this.userData.premiumPass) return;
        if (!this.userData.seasonClaimed) this.userData.seasonClaimed = { free: [], premium: [] };
        const key = isPremium ? 'premium' : 'free';
        if (this.userData.seasonClaimed[key].includes(level)) return;
        if (this._claimingTier) return;      // защита от двойного тапа по «ЗАБРАТЬ»
        this._claimingTier = true;
        try {
        const reward = this.getSeasonReward(level, isPremium);
        let toastMsg = '';
        if (reward.type === 'money') { this.userData.money += reward.value; toastMsg = `+${reward.value.toLocaleString()} ${this.getMoneyIcon()}`; }
        else if (reward.type === 'dilicks') { this.userData.dilicks += reward.value; toastMsg = `+${reward.value.toLocaleString()} ${this.getDilicksIcon()}`; }
        else if (reward.type === 'skin') {
            if (!this.userData.inventory) this.userData.inventory = [];
            if (!this.userData.inventory.includes(reward.skinId)) { this.userData.inventory.push(reward.skinId); toastMsg = `Скин "${reward.name}" ✨`; }
            else { this.userData.dilicks += 1000; toastMsg = `+1000 ${this.getDilicksIcon()} (скин был)`; }
        }
        this.userData.seasonClaimed[key].push(level);
        this._uiCache.claimAll = null;
        this.showToast(`✅ Получено: ${toastMsg}`, 'success');
        this.updateUI();
        this.updateInventory();
        this.updateShopStatus();
        this.updateSeasonUI();
        await this.saveGame(true);   // награду нельзя терять при закрытии
        this.checkAchievements();
        } finally {
            this._claimingTier = false;
        }
    }

    async buyPremiumPass() {
        if (this.userData.premiumPass) return;
        const PREMIUM_COST = 15000;
        if (this.userData.dilicks < PREMIUM_COST) {
            this.showToast(`❌ Недостаточно диликов! Нужно: ${PREMIUM_COST.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
            return;
        }
        this.userData.dilicks -= PREMIUM_COST;
        this.userData.premiumPass = true;
        const oldLevel = this.userData.seasonLevel || 1;
        const bonusLevels = 10;
        const newLevel = Math.min(this.MAX_SEASON_LEVEL, oldLevel + bonusLevels);
        this.userData.seasonLevel = newLevel;
        this.updateUI();
        this.updateSeasonUI();
        await this.saveGame(true);   // покупка за дилики фиксируется сразу
        this.showPremiumActivationAnimation(oldLevel, newLevel);
        this.showToast(`👑 ПРЕМИУМ АКТИВЕН! +${bonusLevels} уровней сразу!`, 'success');
    }
    
    showPremiumActivationAnimation(oldLevel, newLevel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at center,rgba(255,215,0,0.15),rgba(0,0,0,0.9));backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:25px;opacity:0;transition:opacity 0.5s ease;pointer-events:none;';
        const title = document.createElement('div');
        title.textContent = '👑 ПРЕМИУМ АКТИВИРОВАН 👑';
        title.style.cssText = 'font-size:2.5rem;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff8800,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 40px rgba(255,215,0,0.6);opacity:0;transform:translateY(30px) scale(0.8);transition:all 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);text-align:center;';
        const bonusText = document.createElement('div');
        bonusText.textContent = `+${newLevel - oldLevel} УРОВНЕЙ`;
        bonusText.style.cssText = 'font-size:4rem;font-weight:900;color:gold;text-shadow:0 0 30px gold,0 0 60px rgba(255,215,0,0.6);opacity:0;transform:scale(0.3);transition:all 0.5s cubic-bezier(0.68,-0.55,0.265,1.55);';
        const levelTrack = document.createElement('div');
        levelTrack.style.cssText = 'display:flex;align-items:center;gap:15px;color:white;font-size:1.5rem;font-weight:700;opacity:0;transition:opacity 0.5s ease 0.8s;';
        levelTrack.innerHTML = `<span style="color:rgba(255,255,255,0.5);">LVL ${oldLevel}</span><div style="width:300px;height:12px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;position:relative;"><div id="premiumProgressBar" style="position:absolute;top:0;left:0;height:100%;width:0%;background:linear-gradient(90deg,gold,#ffaa00,gold);border-radius:10px;box-shadow:0 0 20px gold;transition:width 1.5s cubic-bezier(0.68,-0.55,0.265,1.55);"></div></div><span style="color:gold;text-shadow:0 0 15px gold;">LVL ${newLevel}</span>`;
        overlay.appendChild(title);
        overlay.appendChild(bonusText);
        overlay.appendChild(levelTrack);
        document.body.appendChild(overlay);
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 10 + 4;
            particle.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:radial-gradient(circle,gold,transparent);border-radius:50%;top:50%;left:50%;box-shadow:0 0 15px gold;pointer-events:none;transition:all ${1.5 + Math.random() * 1.5}s cubic-bezier(0.68,-0.55,0.265,1.55);opacity:1;z-index:100000;`;
            overlay.appendChild(particle);
            const angle = (Math.PI * 2 * i) / 40 + Math.random() * 0.5;
            const distance = 150 + Math.random() * 350;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            setTimeout(() => { particle.style.transform = `translate(${x}px, ${y}px) scale(0)`; particle.style.opacity = '0'; }, 100);
        }
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            setTimeout(() => { title.style.opacity = '1'; title.style.transform = 'translateY(0) scale(1)'; }, 200);
            setTimeout(() => { bonusText.style.opacity = '1'; bonusText.style.transform = 'scale(1)'; if (navigator.vibrate) navigator.vibrate([50, 50, 100]); }, 700);
            setTimeout(() => { levelTrack.style.opacity = '1'; const bar = document.getElementById('premiumProgressBar'); if (bar) bar.style.width = '100%'; }, 1200);
        });
        setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 500); }, 3500);
    }
    
    getLevelsPrice(count) {
        if (count === 1) return 5000;
        if (count === 10) return 45000;
        if (count === 50) return 200000;
        return count * 5000;
    }
    
    openBuyLevelsModal() {
        const modal = document.getElementById('buyLevelsModal');
        if (!modal) return;
        const balanceEl = document.getElementById('buyLevelsBalance');
        if (balanceEl) balanceEl.textContent = (this.userData.dilicks || 0).toLocaleString();
        modal.classList.add('active');
    }
    
    closeBuyLevelsModal() {
        const modal = document.getElementById('buyLevelsModal');
        if (modal) modal.classList.remove('active');
    }
    
    async buySeasonLevels(count) {
        const currentLevel = this.userData.seasonLevel || 1;
        if (currentLevel >= this.MAX_SEASON_LEVEL) { this.showToast('🏆 Максимум!', 'warning'); this.closeBuyLevelsModal(); return; }
        const actualLevels = Math.min(count, this.MAX_SEASON_LEVEL - currentLevel);
        const cost = this.getLevelsPrice(count);
        if (this.userData.dilicks < cost) { this.showToast(`❌ Нужно: ${cost.toLocaleString()} ${this.getDilicksIcon()}`, 'error'); return; }
        this.userData.dilicks -= cost;
        this.userData.seasonLevel = currentLevel + actualLevels;
        this.userData.seasonExp = 0;
        this.updateUI();
        this.updateSeasonUI();
        await this.saveGame(true);   // покупка уровней фиксируется сразу
        this.showLevelsBoughtAnimation(actualLevels, this.userData.seasonLevel);
        this.showToast(`⬆️ +${actualLevels} уровней! Теперь LVL ${this.userData.seasonLevel}`, 'success');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
        this.closeBuyLevelsModal();
    }
    
    showLevelsBoughtAnimation(levelsCount, newLevel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at center,rgba(76,175,80,0.2),rgba(0,0,0,0.85));backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;opacity:0;transition:opacity 0.4s ease;pointer-events:none;';
        const levelsText = document.createElement('div');
        levelsText.innerHTML = `+${levelsCount} <span style="font-size:2.5rem;">УРОВНЕЙ</span>`;
        levelsText.style.cssText = 'font-size:5rem;font-weight:900;color:#4CAF50;text-shadow:0 0 40px #4CAF50,0 0 80px rgba(76,175,80,0.6);opacity:0;transform:scale(0.3) rotate(-15deg);transition:all 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);text-align:center;line-height:1;';
        const levelText = document.createElement('div');
        levelText.textContent = `LVL ${newLevel}`;
        levelText.style.cssText = 'font-size:3rem;font-weight:900;color:gold;text-shadow:0 0 30px gold;opacity:0;transform:translateY(30px);transition:all 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) 0.3s;';
        overlay.appendChild(levelsText);
        overlay.appendChild(levelText);
        document.body.appendChild(overlay);
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 8 + 4;
            particle.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:#4CAF50;border-radius:50%;top:50%;left:50%;box-shadow:0 0 15px #4CAF50;pointer-events:none;transition:all ${1 + Math.random() * 1}s cubic-bezier(0.68,-0.55,0.265,1.55);opacity:1;`;
            overlay.appendChild(particle);
            const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
            const distance = 100 + Math.random() * 300;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            setTimeout(() => { particle.style.transform = `translate(${x}px, ${y}px) scale(0)`; particle.style.opacity = '0'; }, 100);
        }
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            setTimeout(() => { levelsText.style.opacity = '1'; levelsText.style.transform = 'scale(1) rotate(0deg)'; }, 100);
            setTimeout(() => { levelText.style.opacity = '1'; levelText.style.transform = 'translateY(0)'; }, 500);
        });
        setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 500); }, 2200);
    }
    
    initSeasonScroll() {
        const scrollContainer = document.getElementById('seasonTrackScroll');
        const leftBtn = document.getElementById('seasonScrollLeft');
        const rightBtn = document.getElementById('seasonScrollRight');
        if (!scrollContainer) return;
        const scrollAmount = 500;
        if (leftBtn) leftBtn.addEventListener('click', () => scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        if (rightBtn) rightBtn.addEventListener('click', () => scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
        scrollContainer.addEventListener('scroll', () => this.updateScrollButtons());
        scrollContainer.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                scrollContainer.scrollBy({ left: e.deltaY, behavior: 'auto' });
            }
        }, { passive: false });
        this.updateScrollButtons();
    }

    updateScrollButtons() {
        const scrollContainer = document.getElementById('seasonTrackScroll');
        const leftBtn = document.getElementById('seasonScrollLeft');
        const rightBtn = document.getElementById('seasonScrollRight');
        if (!scrollContainer || !leftBtn || !rightBtn) return;
        leftBtn.disabled = scrollContainer.scrollLeft <= 5;
        rightBtn.disabled = scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth - 5);
    }    // ===== ОБМЕННИК ВАЛЮТ =====
    openExchange(from) {
        this.exchangeFrom = from;
        if (from === 'money') {
            this.exchangeTitle.innerHTML = `<img src="${this.MONEY_ICON}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;"><span style="color:gold;margin:0 8px;">→</span><img src="${this.DILICKS_ICON}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;">`;
            this.exchangeRate.innerHTML = `<span style="color:gold;font-weight:700;">500</span> <img src="${this.MONEY_ICON}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin:0 4px;"> <span style="color:gold;font-weight:700;">=</span> <span style="color:gold;font-weight:700;">1</span> <img src="${this.DILICKS_ICON}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin:0 4px;">`;
            this.exchangeInputLabel.textContent = 'Сколько золота отдаёшь:';
            this.exchangeDirection.innerHTML = `<img src="${this.MONEY_ICON}" class="exchange-currency-icon"><span class="exchange-arrow">→</span><img src="${this.DILICKS_ICON}" class="exchange-currency-icon">`;
            this.exchangeInput.placeholder = 'Золото';
            this.exchangeBalanceFrom.innerHTML = `${this.userData.money.toLocaleString()} <img src="${this.MONEY_ICON}" style="width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-left:4px;">`;
        } else {
            this.exchangeTitle.innerHTML = `<img src="${this.DILICKS_ICON}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;"><span style="color:gold;margin:0 8px;">→</span><img src="${this.MONEY_ICON}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;">`;
            this.exchangeRate.innerHTML = `<span style="color:gold;font-weight:700;">1</span> <img src="${this.DILICKS_ICON}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin:0 4px;"> <span style="color:gold;font-weight:700;">=</span> <span style="color:gold;font-weight:700;">500</span> <img src="${this.MONEY_ICON}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin:0 4px;">`;
            this.exchangeInputLabel.textContent = 'Сколько диликов отдаёшь:';
            this.exchangeDirection.innerHTML = `<img src="${this.DILICKS_ICON}" class="exchange-currency-icon"><span class="exchange-arrow">→</span><img src="${this.MONEY_ICON}" class="exchange-currency-icon">`;
            this.exchangeInput.placeholder = 'Дилики';
            this.exchangeBalanceFrom.innerHTML = `${this.userData.dilicks.toLocaleString()} <img src="${this.DILICKS_ICON}" style="width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-left:4px;">`;
        }
        this.exchangeInput.value = '';
        this.updateExchangePreview();
        this.exchangeModal.classList.add('active');
    }
    
    closeExchange() {
        this.exchangeModal.classList.remove('active');
        this.exchangeInput.value = '';
        this.exchangeResultValue.innerHTML = '0';
    }
    
    updateExchangePreview() {
        const amount = parseFloat(this.exchangeInput.value) || 0;
        let result = 0, icon = '';
        if (this.exchangeFrom === 'money') { result = amount / 500; icon = `<img src="${this.DILICKS_ICON}" class="exchange-result-icon">`; }
        else { result = amount * 500; icon = `<img src="${this.MONEY_ICON}" class="exchange-result-icon">`; }
        let formatted;
        if (this.exchangeFrom === 'money') formatted = result === Math.floor(result) ? result.toLocaleString() : result.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        else formatted = Math.floor(result).toLocaleString();
        this.exchangeResultValue.innerHTML = `${formatted} ${icon}`;
        if (this.exchangeFrom === 'money') {
            if (amount > this.userData.money) { this.exchangeConfirmBtn.disabled = true; this.exchangeConfirmBtn.textContent = '❌ НЕДОСТАТОЧНО ЗОЛОТА'; }
            else if (amount <= 0) { this.exchangeConfirmBtn.disabled = true; this.exchangeConfirmBtn.textContent = 'ВВЕДИ СУММУ'; }
            else { this.exchangeConfirmBtn.disabled = false; this.exchangeConfirmBtn.textContent = 'ОБМЕНЯТЬ'; }
        } else {
            if (amount > this.userData.dilicks) { this.exchangeConfirmBtn.disabled = true; this.exchangeConfirmBtn.textContent = '❌ НЕДОСТАТОЧНО ДИЛИКОВ'; }
            else if (amount <= 0) { this.exchangeConfirmBtn.disabled = true; this.exchangeConfirmBtn.textContent = 'ВВЕДИ СУММУ'; }
            else { this.exchangeConfirmBtn.disabled = false; this.exchangeConfirmBtn.textContent = 'ОБМЕНЯТЬ'; }
        }
    }
    
    async confirmExchange() {
        const amount = parseFloat(this.exchangeInput.value) || 0;
        if (amount <= 0) { this.showToast('❌ Введи корректную сумму', 'error'); return; }
        if (this.exchangeFrom === 'money') {
            if (amount > this.userData.money) { this.showToast('❌ Недостаточно золота!', 'error'); return; }
            const dilicksToGive = amount / 500;
            this.userData.money -= amount;
            this.userData.dilicks += dilicksToGive;
            this.showToast(`✅ Обменяно ${amount.toLocaleString()} 🪙 на ${dilicksToGive.toLocaleString()} ${this.getDilicksIcon()}`, 'success');
        } else {
            if (amount > this.userData.dilicks) { this.showToast('❌ Недостаточно диликов!', 'error'); return; }
            const moneyToGive = Math.floor(amount * 500);
            this.userData.dilicks -= amount;
            this.userData.money += moneyToGive;
            this.showToast(`✅ Обменяно ${amount.toLocaleString()} ${this.getDilicksIcon()} на ${moneyToGive.toLocaleString()} 🪙`, 'success');
        }
        this.updateUI();
        await this.saveGame();
        this.checkAchievements();
        if (this.exchangeModal.classList.contains('active')) {
            if (this.exchangeFrom === 'money') {
                this.exchangeBalanceFrom.innerHTML = `${this.userData.money.toLocaleString()} <img src="${this.MONEY_ICON}" style="width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-left:4px;">`;
            } else {
                this.exchangeBalanceFrom.innerHTML = `${this.userData.dilicks.toLocaleString()} <img src="${this.DILICKS_ICON}" style="width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-left:4px;">`;
            }
            this.exchangeInput.value = '';
            this.updateExchangePreview();
        }
    }
    
    // ===== ИВЕНТЫ =====
    showEventsList() {
        const eventsList = document.getElementById('eventsList');
        const uraganContent = document.getElementById('uraganContent');
        const wheelContent = document.getElementById('wheelContent');
        if (eventsList) eventsList.style.display = 'block';
        if (uraganContent) uraganContent.style.display = 'none';
        if (wheelContent) wheelContent.style.display = 'none';
    }
    
    showUraganEvent() {
        const eventsList = document.getElementById('eventsList');
        const uraganContent = document.getElementById('uraganContent');
        const wheelContent = document.getElementById('wheelContent');
        if (eventsList) eventsList.style.display = 'none';
        if (uraganContent) uraganContent.style.display = 'block';
        if (wheelContent) wheelContent.style.display = 'none';
        this.updateUraganUI();
        this.renderUraganQuests();
        this.updateUraganTop();
        this.loadWishlist();
        this.startQuestRefreshTimer();
    }
    
    showWheelEvent() {
        const eventsList = document.getElementById('eventsList');
        const uraganContent = document.getElementById('uraganContent');
        const wheelContent = document.getElementById('wheelContent');
        if (eventsList) eventsList.style.display = 'none';
        if (uraganContent) uraganContent.style.display = 'none';
        if (wheelContent) wheelContent.style.display = 'block';
        if (!this.wheel) this.wheel = new WheelOfFortune(this);
    }
    
    initEventsPage() {
        const eventsUsername = document.getElementById('eventsUsername');
        const eventsDilicks = document.getElementById('eventsDilicks');
        const eventsMoney = document.getElementById('eventsMoney');
        const eventsLogoutBtn = document.getElementById('eventsLogoutBtn');
        if (eventsUsername && this.userData) eventsUsername.textContent = this.userData.settings?.displayName || this.userData.username;
        if (eventsDilicks && this.userData) eventsDilicks.textContent = this.userData.dilicks?.toLocaleString() || 0;
        if (eventsMoney && this.userData) eventsMoney.textContent = this.userData.money?.toLocaleString() || 0;
        if (eventsLogoutBtn) eventsLogoutBtn.addEventListener('click', () => this.logout());
        const userId = localStorage.getItem('userId');
        if (userId) {
            firebase.database().ref('users/' + userId).on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData && eventsUsername) {
                    eventsUsername.textContent = userData.settings?.displayName || userData.username;
                    if (eventsDilicks) eventsDilicks.textContent = userData.dilicks?.toLocaleString() || 0;
                    if (eventsMoney) eventsMoney.textContent = userData.money?.toLocaleString() || 0;
                }
            });
        }
        this.updateEventsTimers();
        const uraganCard = document.getElementById('uraganEventCard');
        const wheelCard = document.getElementById('wheelEventCard');
        const backToEvents = document.getElementById('uraganBackBtn');
        const backFromWheel = document.getElementById('wheelBackBtn');
        if (uraganCard) uraganCard.addEventListener('click', () => this.showUraganEvent());
        if (wheelCard) wheelCard.addEventListener('click', () => this.showWheelEvent());
        if (backToEvents) backToEvents.addEventListener('click', () => this.showEventsList());
        if (backFromWheel) backFromWheel.addEventListener('click', () => this.showEventsList());
    }
    
    updateEventsTimers() {
        const eventsRef = firebase.database().ref('events');
        const formatTimeRemaining = (endTime) => {
            const remaining = Math.max(0, endTime - Date.now());
            if (remaining <= 0) return null;
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
            if (hours > 0) return `${hours}ч ${minutes}м`;
            return `${minutes}м`;
        };
        eventsRef.child('dilicksHurricane').on('value', (snapshot) => {
            const data = snapshot.val();
            const timerEl = document.getElementById('uraganTimer');
            const statusEl = document.getElementById('uraganStatus');
            const cardEl = document.getElementById('uraganEventCard');
            if (data && data.active === true && data.endTime) {
                const timeLeft = formatTimeRemaining(data.endTime);
                if (timeLeft === null) {
                    if (timerEl) timerEl.textContent = 'Ивент завершён';
                    if (statusEl) { statusEl.textContent = 'ЗАВЕРШЁН'; statusEl.className = 'event-status ended'; }
                    if (cardEl) { cardEl.style.opacity = '0.6'; cardEl.classList.add('disabled'); }
                } else {
                    if (timerEl) timerEl.textContent = timeLeft;
                    if (statusEl) { statusEl.textContent = 'АКТИВЕН'; statusEl.className = 'event-status active'; }
                    if (cardEl) { cardEl.style.opacity = '1'; cardEl.classList.remove('disabled'); }
                }
            } else {
                if (timerEl) timerEl.textContent = 'Не активен';
                if (statusEl) { statusEl.textContent = 'НЕ АКТИВЕН'; statusEl.className = 'event-status ended'; }
                if (cardEl) { cardEl.style.opacity = '0.5'; cardEl.classList.add('disabled'); }
            }
        });
        eventsRef.child('wheelEvent').on('value', (snapshot) => {
            const data = snapshot.val();
            const timerEl = document.getElementById('wheelTimer');
            const statusEl = document.getElementById('wheelStatus');
            const cardEl = document.getElementById('wheelEventCard');
            if (data && data.active === true && data.endTime) {
                const timeLeft = formatTimeRemaining(data.endTime);
                if (timeLeft === null) {
                    if (timerEl) timerEl.textContent = 'Ивент завершён';
                    if (statusEl) { statusEl.textContent = 'ЗАВЕРШЁН'; statusEl.className = 'event-status ended'; }
                    if (cardEl) { cardEl.style.opacity = '0.6'; cardEl.classList.add('disabled'); }
                } else {
                    if (timerEl) timerEl.textContent = timeLeft;
                    if (statusEl) { statusEl.textContent = 'АКТИВЕН'; statusEl.className = 'event-status active'; }
                    if (cardEl) { cardEl.style.opacity = '1'; cardEl.classList.remove('disabled'); }
                }
            } else {
                if (timerEl) timerEl.textContent = 'Не активен';
                if (statusEl) { statusEl.textContent = 'НЕ АКТИВЕН'; statusEl.className = 'event-status ended'; }
                if (cardEl) { cardEl.style.opacity = '0.5'; cardEl.classList.add('disabled'); }
            }
        });
    }
    
    checkAndResetQuests() {
        const FOUR_HOURS = 4 * 60 * 60 * 1000;
        const now = Date.now();
        const lastReset = this.userData.eventQuests?.lastReset || 0;
        if (now - lastReset >= FOUR_HOURS) {
            this.userData.eventQuests = { lastReset: now, quests: this.generateDailyQuests() };
            this.saveGame();
            this.showToast('🔄 Задания ивента обновлены!', 'success');
            const el = document.getElementById('uraganContent');
            if (el && el.style.display === 'block') this.renderUraganQuests();
        }
    }
    
    generateDailyQuests() {
        const allQuests = [
            { id: 'clicks', name: 'Сделать кликов', target: 1000, reward: 5000 },
            { id: 'clicks2', name: 'Сделать кликов x2', target: 5000, reward: 15000 },
            { id: 'clicks3', name: 'Сделать кликов x3', target: 10000, reward: 25000 },
            { id: 'dilicksEarned', name: 'Заработать диликов', target: 10000, reward: 10000 },
            { id: 'dilicksEarned2', name: 'Заработать диликов x2', target: 50000, reward: 30000 },
            { id: 'wheelSpins', name: 'Крутить колесо', target: 5, reward: 5000 },
            { id: 'wheelSpins2', name: 'Крутить колесо x2', target: 15, reward: 15000 },
            { id: 'upgrades', name: 'Купить улучшений', target: 3, reward: 5000 },
            { id: 'upgrades2', name: 'Купить улучшений x2', target: 10, reward: 15000 },
            { id: 'moneyEarned', name: 'Заработать денег', target: 100000, reward: 5000 },
            { id: 'moneyEarned2', name: 'Заработать денег x2', target: 500000, reward: 15000 }
        ];
        const shuffled = [...allQuests];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selected = shuffled.slice(0, 5);
        selected.push({ id: 'all', name: 'Выполнить все задания', target: 1, reward: 50000 });
        return selected.map(q => ({ id: q.id, name: q.name, target: q.target, reward: q.reward, progress: 0, completed: false }));
    }
    
    startQuestRefreshTimer() {
        const timerElement = document.getElementById('questsRefreshTimer');
        if (!timerElement) return;
        const updateTimer = () => {
            const lastReset = this.userData.eventQuests?.lastReset || 0;
            const FOUR_HOURS = 4 * 60 * 60 * 1000;
            const nextReset = lastReset + FOUR_HOURS;
            const remaining = Math.max(0, nextReset - Date.now());
            if (remaining <= 0) {
                timerElement.textContent = 'Обновление...';
                this.checkAndResetQuests();
                setTimeout(() => updateTimer(), 1000);
                return;
            }
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            timerElement.textContent = `Следующее обновление: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        updateTimer();
        if (this.questTimerInterval) clearInterval(this.questTimerInterval);
        this.questTimerInterval = setInterval(updateTimer, 1000);
    }
    
    updateQuestProgress(type, amount = 1) {
        if (!this.userData.eventQuests) return;
        let changed = false;
        for (let quest of this.userData.eventQuests.quests) {
            if (quest.completed) continue;
            if (quest.id === type) {
                quest.progress = Math.min(quest.target, quest.progress + amount);
                if (quest.progress >= quest.target && !quest.completed) {
                    quest.completed = true;
                    this.userData.dilicks += quest.reward;
                    changed = true;
                    this.showToast(`✅ Задание "${quest.name}" выполнено! +${quest.reward.toLocaleString()} ${this.getDilicksIcon()}`, 'success');
                }
                break;
            }
        }
        const allQuest = this.userData.eventQuests.quests.find(q => q.id === 'all');
        if (allQuest && !allQuest.completed) {
            // было filter(...).length === 5 — лишние аллокации в цикле клика
            let completedCount = 0;
            for (const q of this.userData.eventQuests.quests) {
                if (q.id !== 'all' && q.completed) completedCount++;
            }
            if (completedCount === 5) {
                allQuest.completed = true;
                this.userData.dilicks += allQuest.reward;
                changed = true;
                this.showToast(`✅ Задание "Выполнить все задания" выполнено! +${allQuest.reward.toLocaleString()} ${this.getDilicksIcon()}`, 'success');
            }
        }
        if (changed) { this.saveGame(); this.renderUraganQuests(); }
    }
    
    getDilicksIcon() { return `<img src="${this.DILICKS_ICON}" style="width: 16px; height: 16px; border-radius: 50%; vertical-align: middle;">`; }
    getMoneyIcon() { return `<img src="${this.MONEY_ICON}" style="width: 16px; height: 16px; border-radius: 50%; vertical-align: middle;">`; }
    
    async loadWishlist() {
        const wishlistGrid = document.getElementById('wishlistGrid');
        if (!wishlistGrid) return;
        const savedWishlist = this.userData.wishlist || null;
        const wishlistItems = wishlistGrid.querySelectorAll('.wishlist-item');
        wishlistItems.forEach(item => {
            const wishValue = item.dataset.wish;
            if (savedWishlist === wishValue) item.classList.add('selected');
            else item.classList.remove('selected');
            item.removeEventListener('click', this.wishlistClickHandler);
            this.wishlistClickHandler = async () => {
                wishlistItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.userData.wishlist = wishValue;
                await this.saveGame();
                this.showToast(`🎁 Вишлист обновлен`, 'success');
            };
            item.addEventListener('click', this.wishlistClickHandler);
        });
    }
    
    initUraganEvent() {
        const eventsRef = firebase.database().ref('events/dilicksHurricane');
        eventsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            this.uraganEventActive = data && data.active === true;
            this.currentUraganMultiplier = data?.multiplier || 1;
            this.updateUraganUI();
        });
        setInterval(() => {
            const el = document.getElementById('uraganContent');
            if (el && el.style.display === 'block') { this.updateUraganTop(); this.renderUraganQuests(); }
        }, 10000);
    }
    
    updateUraganUI() {
        const multiplierDisplay = document.getElementById('multiplierDisplay');
        const eventTimer = document.getElementById('eventTimer');
        const dayBadge = document.getElementById('dayBadge');
        const totalPoolSpan = document.getElementById('totalPool');
        const poolProgressFill = document.getElementById('poolProgress');
        const uraganUsername = document.getElementById('uraganUsername');
        const uraganDilicks = document.getElementById('uraganDilicks');
        const userContributionSpan = document.getElementById('userContribution');
        if (uraganUsername && this.userData) uraganUsername.textContent = this.userData.settings?.displayName || this.userData.username;
        if (uraganDilicks && this.userData) uraganDilicks.textContent = this.userData.dilicks?.toLocaleString() || 0;
        if (userContributionSpan && this.userData) userContributionSpan.textContent = this.userData.eventContribution?.toLocaleString() || 0;
        if (this.uraganEventActive && this.currentUraganMultiplier) {
            if (multiplierDisplay) multiplierDisplay.textContent = `x${this.currentUraganMultiplier} ДИЛИКОВ`;
        } else {
            if (multiplierDisplay) multiplierDisplay.textContent = 'x1 ДИЛИКОВ';
        }
        firebase.database().ref('events/dilicksHurricane').once('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data.active === true) {
                if (data.endTime) {
                    const remaining = Math.max(0, data.endTime - Date.now());
                    if (remaining <= 0) { if (eventTimer) eventTimer.textContent = 'Ивент завершён'; }
                    else {
                        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                        if (eventTimer) {
                            if (days > 0) eventTimer.textContent = `${days}д ${hours}ч ${minutes}м`;
                            else if (hours > 0) eventTimer.textContent = `${hours}ч ${minutes}м`;
                            else eventTimer.textContent = `${minutes}м`;
                        }
                    }
                }
                const day = data.day || 1;
                if (dayBadge) dayBadge.textContent = `ДЕНЬ ${day}`;
                const totalPool = data.totalPool || 0;
                const progress = (totalPool / 100000000) * 100;
                if (totalPoolSpan) totalPoolSpan.textContent = totalPool.toLocaleString();
                if (poolProgressFill) poolProgressFill.style.width = Math.min(100, progress) + '%';
            } else {
                if (eventTimer) eventTimer.textContent = 'Не активен';
                if (dayBadge) dayBadge.textContent = 'ДЕНЬ -';
                if (totalPoolSpan) totalPoolSpan.textContent = '0';
                if (poolProgressFill) poolProgressFill.style.width = '0%';
            }
        });
    }
    
    renderUraganQuests() {
        const questsList = document.getElementById('questsList');
        if (!questsList) return;
        questsList.innerHTML = '';
        if (!this.userData.eventQuests) return;
        this.userData.eventQuests.quests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.className = 'quest-item';
            const isCompleted = quest.completed;
            const progressPercent = (quest.progress / quest.target) * 100;
            questItem.innerHTML = `<div class="quest-info"><div class="quest-name">${quest.name}</div><div class="quest-progress">${quest.progress.toLocaleString()} / ${quest.target.toLocaleString()}</div><div class="progress-bar" style="height: 4px; margin-top: 5px;"><div class="progress-fill" style="width: ${progressPercent}%; height: 4px;"></div></div></div><div class="quest-reward">+${quest.reward.toLocaleString()} ${this.getDilicksIcon()}</div><div class="quest-status ${isCompleted ? 'completed' : 'active'}">${isCompleted ? '✅ ВЫПОЛНЕНО' : '🏃 В ПРОЦЕССЕ'}</div>`;
            questsList.appendChild(questItem);
        });
    }
    
    async updateUraganTop() {
        const topList = document.getElementById('topList');
        if (!topList) return;
        if (this._uraganTopBusy) return;      // не запускаем повторно, пока идёт загрузка
        this._uraganTopBusy = true;
        topList.innerHTML = '<div class="top-item">Загрузка...</div>';
        try {
            // Раньше читалась ВСЯ ветка users целиком — тот же тяжёлый запрос, что
            // и в лидерборде. Теперь: список игроков + чтение по одному с таймаутом.
            let topPlayers = [];
            try {
                const ids = await this._fetchUserIds();
                if (ids.length === 0) throw new Error('нет списка игроков');

                const self = this;
                let cursor = 0;
                async function worker() {
                    while (cursor < ids.length) {
                        const id = ids[cursor++];
                        try {
                            const contribution = Number(await self._restGet('/users/' + id + '/eventContribution.json', 6000)) || 0;
                            if (contribution > 0) topPlayers.push({ name: id, contribution, id });
                        } catch (e) { /* пропускаем только этого игрока */ }
                    }
                }
                const workers = [];
                for (let i = 0; i < Math.min(6, ids.length); i++) workers.push(worker());
                await Promise.all(workers);

                // имена нужны только для тех, кто реально в топе
                topPlayers.sort((a, b) => b.contribution - a.contribution);
                topPlayers = topPlayers.slice(0, 10);
                await Promise.all(topPlayers.map(async (p) => {
                    try {
                        const nm = await this._restGet('/users/' + p.id + '/username.json', 6000);
                        if (nm) p.name = nm;
                    } catch (e) { /* оставляем id вместо имени */ }
                }));
            } catch (e) {
                console.warn('Топ ивента: быстрый путь не сработал, пробую полное чтение');
                const snapshot = await this._withTimeout(firebase.database().ref('users').once('value'), 10000);
                const users = snapshot.val() || {};
                topPlayers = [];
                for (const [id, user] of Object.entries(users)) {
                    if (!user || typeof user !== 'object') continue;
                    const contribution = Number(user.eventContribution) || 0;
                    if (contribution > 0) topPlayers.push({ name: user.settings?.displayName || user.username || 'Игрок', contribution, id });
                }
                topPlayers.sort((a, b) => b.contribution - a.contribution);
                topPlayers = topPlayers.slice(0, 10);
            }

            topList.innerHTML = '';
            if (topPlayers.length === 0) { topList.innerHTML = '<div class="top-item">Пока нет участников</div>'; return; }
            topPlayers.forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'top-item';
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                item.innerHTML = `<div class="top-rank">${medal || (index + 1)}</div><div class="top-name">${player.name} ${player.id === localStorage.getItem('userId') ? '👑' : ''}</div><div class="top-value">${player.contribution.toLocaleString()} ${this.getDilicksIcon()}</div>`;
                topList.appendChild(item);
            });
        } catch (error) {
            console.error(error);
            topList.innerHTML = '<div class="top-item">Не удалось загрузить</div>';
        } finally {
            this._uraganTopBusy = false;
        }
    }
    
    // Вклад в ивент. Раньше на КАЖДЫЙ КЛИК выполнялись чтение всей ветки ивента из
    // базы + запись + сохранение профиля. Теперь вклад копится локально, а в базу
    // уходит раз в 5 секунд через транзакцию (атомарный инкремент — без гонок, когда
    // играют несколько человек одновременно).
    addEventContribution(amount) {
        if (!this.uraganEventActive) return;
        if (amount <= 0) return;
        const booster = (this.userData.eventBooster || 0) * 0.05;
        const boostedAmount = Math.floor(amount * (1 + booster));
        this.userData.eventContribution = (this.userData.eventContribution || 0) + boostedAmount;
        this._eventAccum = (this._eventAccum || 0) + boostedAmount;

        if (this._eventContribEl === undefined) this._eventContribEl = document.getElementById('userContribution');
        if (this._eventContribEl) {
            const text = this.formatNumber(this.userData.eventContribution);
            if (this._eventContribEl.textContent !== text) this._eventContribEl.textContent = text;
        }

        if (!this._eventFlushTimer) {
            this._eventFlushTimer = setTimeout(() => {
                this._eventFlushTimer = null;
                this.flushEventContribution();
            }, 5000);
        }
        this.saveGame();
    }

    flushEventContribution() {
        const pending = this._eventAccum || 0;
        if (pending <= 0) return;
        this._eventAccum = 0;
        try {
            firebase.database().ref('events/dilicksHurricane/totalPool').transaction((current) => {
                return (current || 0) + pending;
            }).catch((error) => {
                console.error('❌ Ошибка обновления пула ивента:', error);
                this._eventAccum = (this._eventAccum || 0) + pending;
            });
        } catch (error) {
            console.error('❌ Ошибка обновления пула ивента:', error);
            this._eventAccum = (this._eventAccum || 0) + pending;
        }
    }
    
    handleClick(e) {
        if (!this.isLoaded && this.userData) this.isLoaded = true;
        const skinMultipliers = this.getSkinMultipliers();
        const skinMultiplier = skinMultipliers[this.userData.currentSkin] || 1;
        let clickPower = this.userData.clickPower * skinMultiplier;
        const rechargeBonus = (this.userData.rechargeBonus || 0) * 0.1;
        clickPower = Math.floor(clickPower * (1 + rechargeBonus));
        const uraganMultiplier = this.uraganEventActive ? this.currentUraganMultiplier : 1;
        const dilicksEarned = uraganMultiplier;
        let moneyEarned = clickPower;
        let critMultiplier = 2;
        const masteryBonus = (this.userData.clickerMastery || 0) * 0.1;
        critMultiplier = 2 + masteryBonus;
        const critRoll = Math.random() * 100;
        if (critRoll < this.userData.critChance) {
            moneyEarned *= critMultiplier;
            this.createClickEffect(e.clientX, e.clientY, `КРИТ! x${Math.floor(moneyEarned)}`);
        } else {
            this.createClickEffect(e.clientX, e.clientY, `+${moneyEarned}`);
        }
        this.userData.clicks++;
        this.userData.money += moneyEarned;
        this.userData.dilicks += dilicksEarned;
        if (this.uraganEventActive) this.addEventContribution(dilicksEarned);
        this.addSeasonExp(moneyEarned);
        this.updateUI();
        this.saveGame();
        this.checkAchievements();
        this.updateQuestProgress('clicks');
        this.updateQuestProgress('dilicksEarned', dilicksEarned);
        this.updateQuestProgress('moneyEarned', moneyEarned);
    }
    
    // Кэш положения контейнера эффектов: getBoundingClientRect() на каждый клик
    // заставлял браузер синхронно пересчитывать layout. Сбрасываем кэш при скролле,
    // повороте экрана и смене вкладки.
    _invalidateRects() {
        this._effectsRect = null;
        this._effectsRectTime = 0;
    }

    _getEffectsRect() {
        const now = Date.now();
        if (this._effectsRect && (now - (this._effectsRectTime || 0)) < 100) return this._effectsRect;
        const rect = this.clickEffects.getBoundingClientRect();
        this._effectsRect = { left: rect.left, top: rect.top };
        this._effectsRectTime = now;
        return this._effectsRect;
    }

    createClickEffect(x, y, text) {
        if (!this.clickEffects) return;
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.textContent = text;
        const rect = this._getEffectsRect();
        effect.style.left = (x - rect.left) + 'px';
        effect.style.top = (y - rect.top) + 'px';
        this.clickEffects.appendChild(effect);
        setTimeout(() => { if (effect.parentNode) effect.remove(); }, 600);
    }
    
    async buyItem(item, price) {
        if (item === 'wheel_dragon_skin') { this.showToast('❌ Этот скин можно получить только в колесе фортуны!', 'error'); return; }
        if (item.startsWith('uragan_')) { this.showToast('❌ Этот скин можно получить только в ивенте!', 'error'); return; }
        if (this.userData.inventory && this.userData.inventory.includes(item)) { this.showToast('⚠️ Этот скин уже куплен!', 'warning'); return; }
        if (item === 'dragon_skin') {
            if (this.userData.dilicks >= price) this.userData.dilicks -= price;
            else { this.showToast(`❌ Недостаточно диликов!`, 'error'); return; }
        } else {
            if (this.userData.money >= price) this.userData.money -= price;
            else { this.showToast(`❌ Недостаточно денег!`, 'error'); return; }
        }
        if (!this.userData.inventory) this.userData.inventory = [];
        if (!this.userData.inventory.includes(item)) this.userData.inventory.push(item);
        this.userData.currentSkin = item;
        if (this.clickIcon) this.clickIcon.src = this.skinsData[item].image;
        this.updateUI();
        await this.saveGame(true);   // покупка скина фиксируется сразу
        this.updateInventory();
        this.updateShopStatus();
        this.checkAchievements();
        this.showToast(`✅ Куплен скин: ${this.skinsData[item].name}`, 'success');
    }
    
    renderUpgrades() {
        if (!this.upgradesGrid) return;
        const upgrades = [
            { id: 'clickPower', name: 'Усилитель клика', description: 'Увеличивает силу клика', basePrice: 50, priceMultiplier: 25, getLevel: () => this.userData.clickPower, maxLevel: 100, effect: () => `+${this.userData.clickPower} к клику` },
            { id: 'autoClicker', name: 'Автокликер', description: 'Автоматические клики каждую секунду', basePrice: 100, priceMultiplier: 100, getLevel: () => this.userData.autoClickerLevel, maxLevel: 100, effect: () => `${this.userData.autoClickerLevel} кликов/сек` },
            { id: 'critChance', name: 'Критический удар', description: 'Шанс нанести крит урон', basePrice: 200, priceMultiplier: 50, getLevel: () => this.userData.critChance, maxLevel: 100, effect: () => `${this.userData.critChance}% шанс крита` },
            { id: 'rechargeBonus', name: 'Бонус перезарядки', description: '+10% к силе клика', basePrice: 500, priceMultiplier: 200, getLevel: () => this.userData.rechargeBonus || 0, maxLevel: 50, effect: () => `x${1 + (this.userData.rechargeBonus || 0) * 0.1} к силе` },
            { id: 'clickerMastery', name: 'Мастерство кликера', description: 'Увеличивает крит множитель', basePrice: 1000, priceMultiplier: 300, getLevel: () => this.userData.clickerMastery || 0, maxLevel: 30, effect: () => `x${2 + (this.userData.clickerMastery || 0) * 0.1} крит` },
            { id: 'eventBooster', name: 'Усилитель ивентов', description: '+5% к диликам в ивентах', basePrice: 1500, priceMultiplier: 400, getLevel: () => this.userData.eventBooster || 0, maxLevel: 20, effect: () => `+${(this.userData.eventBooster || 0) * 5}%` }
        ];
        this.upgradesGrid.innerHTML = '';
        for (const upgrade of upgrades) {
            const currentLevel = upgrade.getLevel();
            const price = upgrade.basePrice + (currentLevel * upgrade.priceMultiplier);
            const isMaxLevel = currentLevel >= upgrade.maxLevel;
            const card = document.createElement('div');
            card.className = 'glass-card upgrade-item liquid-glass';
            card.dataset.upgrade = upgrade.id;
            card.innerHTML = `<h3>${upgrade.name}</h3><p class="upgrade-description">${upgrade.description}</p><p>Уровень: <span class="upgrade-level">${currentLevel}</span> / ${upgrade.maxLevel}</p><p>Эффект: <span class="upgrade-effect">${upgrade.effect()}</span></p><p class="upgrade-price">${this.getDilicksIcon()} <span class="price-value">${price.toLocaleString()}</span></p>${!isMaxLevel ? '<button class="glass-btn upgrade-btn liquid-glass">Улучшить</button>' : '<button class="glass-btn upgrade-btn liquid-glass disabled" disabled>МАКСИМУМ</button>'}`;
            if (!isMaxLevel) {
                const btn = card.querySelector('.upgrade-btn');
                btn.addEventListener('click', () => this.buyUpgrade(upgrade.id, price));
            }
            this.upgradesGrid.appendChild(card);
        }
    }
    
    async buyUpgrade(upgradeType, price) {
        let success = false;
        switch(upgradeType) {
            case 'clickPower': if (this.userData.dilicks >= price) { this.userData.dilicks -= price; this.userData.clickPower++; success = true; } break;
            case 'autoClicker': if (this.userData.dilicks >= price) { this.userData.dilicks -= price; this.userData.autoClickerLevel++; this.restartAutoClicker(); success = true; } break;
            case 'critChance': if (this.userData.dilicks >= price) { this.userData.dilicks -= price; this.userData.critChance += 5; success = true; } break;
            case 'rechargeBonus': if (this.userData.dilicks >= price) { this.userData.dilicks -= price; this.userData.rechargeBonus = (this.userData.rechargeBonus || 0) + 1; success = true; } break;
            case 'clickerMastery': if (this.userData.dilicks >= price) { this.userData.dilicks -= price; this.userData.clickerMastery = (this.userData.clickerMastery || 0) + 1; success = true; } break;
            case 'eventBooster': if (this.userData.dilicks >= price) { this.userData.dilicks -= price; this.userData.eventBooster = (this.userData.eventBooster || 0) + 1; success = true; } break;
        }
        if (!success) { this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error'); return; }
        this.showToast(`✅ Улучшение прокачано!`, 'success');
        this.renderUpgrades();
        this.updateUI();
        await this.saveGame(true);   // списанные дилики фиксируем сразу
        this.checkAchievements();
        this.updateQuestProgress('upgrades');
    }
    
    updateShopStatus() {
        document.querySelectorAll('.shop-item').forEach(item => {
            const skinId = item.dataset.skin;
            const statusEl = document.getElementById(`status-${skinId}`);
            const buyBtn = item.querySelector('.buy-btn');
            if (this.userData.inventory && this.userData.inventory.includes(skinId)) {
                if (statusEl) statusEl.textContent = 'В инвентаре';
                if (buyBtn) { buyBtn.textContent = 'Куплено'; buyBtn.classList.add('disabled'); buyBtn.disabled = true; }
            } else {
                if (statusEl) statusEl.textContent = 'Не куплено';
                if (buyBtn) { buyBtn.textContent = 'Купить'; buyBtn.classList.remove('disabled'); buyBtn.disabled = false; }
            }
        });
    }
    
    updateInventory() {
        if (!this.inventoryGrid) return;
        // Пропускаем перерисовку, если инвентарь и активный скин не менялись
        const invKey = (this.userData.inventory || []).join(',') + '|' + this.userData.currentSkin;
        if (this._inventoryKey === invKey) return;
        this._inventoryKey = invKey;
        this.inventoryGrid.innerHTML = '';
        const inventory = this.userData.inventory || ['classic'];
        if (!inventory.includes('classic')) inventory.unshift('classic');
        inventory.forEach((skinId) => {
            const skin = this.skinsData[skinId];
            if (!skin) return;
            const skinCard = document.createElement('div');
            skinCard.className = `glass-card inventory-item ${this.userData.currentSkin === skinId ? 'active' : ''}`;
            skinCard.dataset.skin = skinId;
            const isCurrentSkin = this.userData.currentSkin === skinId;
            let extraClass = '';
            if (skinId === 'uragan_dragon_top3') extraClass = 'skin-uragan-top3';
            if (skinId === 'uragan_holo_top10') extraClass = 'skin-uragan-top10';
            if (skinId === 'uragan_banana_top50') extraClass = 'skin-uragan-top50';
            if (skinId === 'uragan_cursor_top100') extraClass = 'skin-uragan-top100';
            if (extraClass) skinCard.classList.add(extraClass);
            skinCard.innerHTML = `<div class="skin-preview"><img src="${skin.image}" alt="${skin.name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/4366/4366891.png'"></div><h3>${skin.name}</h3><p class="skin-description">${skin.description}</p>${skin.multiplier > 1 ? `<p class="skin-multiplier">✨ x${skin.multiplier} множитель!</p>` : ''}${isCurrentSkin ? '<p class="skin-equipped">✅ ЭКИПИРОВАНО</p>' : '<button class="glass-btn equip-btn liquid-glass">ЭКИПИРОВАТЬ</button>'}`;
            const equipBtn = skinCard.querySelector('.equip-btn');
            if (equipBtn) equipBtn.addEventListener('click', (e) => { e.stopPropagation(); this.equipSkin(skinId); });
            this.inventoryGrid.appendChild(skinCard);
        });
    }
    
    async equipSkin(skinId) {
        this.userData.currentSkin = skinId;
        if (this.clickIcon) this.clickIcon.src = this.skinsData[skinId].image;
        const multiplier = this.getSkinMultiplier(skinId);
        if (multiplier > 1 && this.clickPowerSpan && this.userData) this.clickPowerSpan.textContent = this.userData.clickPower * multiplier;
        await this.saveGame(true);   // экипировку фиксируем сразу
        this.updateInventory();
        this.createClickEffect(window.innerWidth / 2, window.innerHeight / 2, `✨ ${this.skinsData[skinId].name} ✨`);
        if (this.clickIcon) { this.clickIcon.style.transform = 'scale(0.8)'; setTimeout(() => { if (this.clickIcon) this.clickIcon.style.transform = 'scale(1)'; }, 200); }
        this.showToast(`✨ Экипирован скин: ${this.skinsData[skinId].name}${multiplier > 1 ? ` (x${multiplier})` : ''}`, 'success');
    }
    
    // Карта множителей скинов: раньше объект создавался заново на каждый клик и
    // на каждую итерацию автокликера — теперь создаётся один раз.
    getSkinMultipliers() {
        if (!this._skinMultipliers) {
            this._skinMultipliers = { 'uragan_dragon_top3': 145, 'uragan_holo_top10': 100, 'uragan_banana_top50': 55, 'uragan_cursor_top100': 15, 'wheel_dragon_skin': 250 };
        }
        return this._skinMultipliers;
    }

    startAutoClicker() {
        if (this.autoClickerInterval) clearInterval(this.autoClickerInterval);
        this.autoClickerInterval = setInterval(() => {
            if (this.userData.autoClickerLevel > 0 && this.isLoaded) {
                const skinMultipliers = this.getSkinMultipliers();
                const skinMultiplier = skinMultipliers[this.userData.currentSkin] || 1;
                const rechargeBonus = (this.userData.rechargeBonus || 0) * 0.1;
                const critMultiplier = 2 + (this.userData.clickerMastery || 0) * 0.1;
                const baseClickPower = Math.floor(this.userData.clickPower * skinMultiplier * (1 + rechargeBonus));
                const uraganMultiplier = this.uraganEventActive ? this.currentUraganMultiplier : 1;
                const iterations = this.userData.autoClickerLevel;

                let moneyTotal = 0;
                let dilicksTotal = 0;
                let seasonXpTotal = 0;
                for (let i = 0; i < iterations; i++) {
                    let moneyEarned = baseClickPower;
                    if (Math.random() * 100 < this.userData.critChance) moneyEarned *= critMultiplier;
                    moneyTotal += moneyEarned;
                    dilicksTotal += uraganMultiplier;
                    // XP считаем пачкой: раньше на каждую итерацию шло отдельное
                    // обновление сезонной ленты — из-за этого автокликер и лагал.
                    seasonXpTotal += Math.max(1, Math.floor(moneyEarned / 100));
                }

                this.userData.clicks += iterations;
                this.userData.money += moneyTotal;
                this.userData.dilicks += dilicksTotal;
                if (this.uraganEventActive) this.addEventContribution(dilicksTotal);
                this.addSeasonExpBatch(seasonXpTotal * 100);

                this.updateUI();
                this.saveGame();
                this.checkAchievements();
                this.updateQuestProgress('clicks', iterations);
                this.updateQuestProgress('dilicksEarned', dilicksTotal);
                this.updateQuestProgress('moneyEarned', moneyTotal);
            }
        }, 1000);
    }
    
    restartAutoClicker() { this.startAutoClicker(); }
    
    startPlaytimeTracker() {
        this.playtimeInterval = setInterval(() => {
            if (this.isLoaded) { this.userData.playtime++; this.updatePlaytimeDisplay(); this.saveGame(); }
        }, 1000);
    }
    
    updatePlaytimeDisplay() {
        if (!this.playtimeSpan) return;
        const hours = Math.floor(this.userData.playtime / 3600);
        const minutes = Math.floor((this.userData.playtime % 3600) / 60);
        const seconds = this.userData.playtime % 60;
        this.playtimeSpan.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    async showPlayerProfile(playerId, playerName) {
        const modal = document.getElementById('playerProfileModal');
        if (!modal) return;
        try {
            const userData = await this._restGet('/users/' + playerId + '.json', 10000);
            if (!userData || typeof userData !== 'object') { this.showToast('❌ Игрок не найден', 'error'); return; }
            const username = userData.settings?.displayName || userData.username;
            document.getElementById('modalUsername').textContent = username;
            document.getElementById('modalClicks').textContent = (userData.clicks || 0).toLocaleString();
            document.getElementById('modalMoney').textContent = (userData.money || 0).toLocaleString();
            document.getElementById('modalDilicks').textContent = (userData.dilicks || 0).toLocaleString();
            document.getElementById('modalLevel').textContent = userData.seasonLevel || 1;
            const avatarImg = document.getElementById('modalAvatar');
            if (userData.currentSkin && this.skinsData[userData.currentSkin]) avatarImg.src = this.skinsData[userData.currentSkin].image;
            else avatarImg.src = 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png';
            modal.classList.add('active');
            const closeBtn = document.getElementById('closeProfileModal');
            if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
            modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
        } catch (error) { console.error(error); this.showToast('❌ Ошибка загрузки профиля', 'error'); }
    }
    
    async updateLeaderboard(type) {
        if (!this.leaderboardBody) return;
        this._leaderboardType = type;

        // Сразу показываем прошлую удачную загрузку (если была) — таблица
        // появляется мгновенно, а свежие данные подставляются по мере чтения.
        const cached = this._leaderboardCache && this._leaderboardCache[type];
        if (cached && cached.length > 0) {
            this._renderLeaderboard(cached.slice(), type, { count: 0 });
        } else {
            this.leaderboardBody.innerHTML = '<tr><td colspan="3" class="empty-history">Загрузка...</td></tr>';
        }

        // Загрузка идёт и при старте игры, и при открытии вкладки — не запускаем
        // вторую параллельно, иначе база получает двойную нагрузку и обе тормозят.
        if (this._leaderboardLoading) {
            console.log('Таблица уже загружается — показываю то, что есть');
            return;
        }
        this._leaderboardLoading = true;
        try {
            await this._loadLeaderboard(type);
        } finally {
            this._leaderboardLoading = false;
        }
    }

    async _loadLeaderboard(type) {
        const failed = { count: 0 };
        const cached = this._leaderboardCache && this._leaderboardCache[type];

        // ОСНОВНОЙ ПУТЬ: список игроков + чтение по одному.
        // ПУТЬ 1 (основной): вся ветка одним запросом.
        // База пересобрана (октябрь 2026) и теперь отдаёт ветку целиком за ~170 мс
        // против ~540 мс при чтении по одному. Если запрос не пройдёт — уходим
        // на путь 2, поэтому резкость базы игру больше не ломает.
        let reason = '';
        try {
            const users = await this._restGetOnce('/users.json', 8000) || {};
            const entries = [];
            for (const [id, userData] of Object.entries(users)) {
                if (!userData || typeof userData !== 'object') continue;
                entries.push({
                    id,
                    username: (userData.settings && userData.settings.displayName) || userData.username || 'Игрок',
                    value: this._leaderboardValue(userData, type),
                    realUsername: userData.username
                });
            }
            if (entries.length === 0) throw new Error('ветка users пуста');
            this._rememberLeaderboardEntries(entries, type);
            this._renderLeaderboard(this._leaderboardCache[type].slice(), type, { count: 0 });
            return;
        } catch (error) {
            reason = (error && error.message) ? error.message : String(error);
            console.warn('Чтение всей ветки не удалось (' + reason + ') — читаю по одному');
        }

        // ПУТЬ 2 (резерв): по одному с повторами.
        // Нужен на случай, если база снова начнёт подвисать на агрегатных запросах.
        try {
            const list = await this._fetchUserIds();
            if (list.length === 0) throw new Error('список игроков пуст (адрес базы: ' + this._dbBaseUrl() + ')');

            const entries = await this._fetchLeaderboardEntries(list, failed);
            if (entries.length === 0) {
                this.leaderboardBody.innerHTML = `<tr><td colspan="3" class="empty-history">Не удалось прочитать профили (${failed.count} из ${list.length})</td></tr>`;
                return;
            }
            this._rememberLeaderboardEntries(entries, type);
            this._renderLeaderboard(this._leaderboardCache[type].slice(), type, failed);
            return;
        } catch (error) {
            console.error(error);
            const reason2 = (error && error.message) ? error.message : String(error);
            // Если есть прошлая удачная загрузка — показываем её, а не пустой экран
            if (cached && cached.length > 0) {
                this._renderLeaderboard(cached.slice(), type, { count: cached.length });
                console.warn('Показываю сохранённую таблицу: свежую загрузить не удалось (' + (reason || reason2) + ')');
            } else {
                // Показываем настоящую причину: без неё невозможно понять, что чинить
                this.leaderboardBody.innerHTML = `<tr><td colspan="3" class="empty-history">Не удалось загрузить таблицу<br><span style="opacity:.6;font-size:.8em">${reason || reason2}</span></td></tr>`;
            }
        }
    }

    // value из уже загруженной записи игрока
    _leaderboardValue(userData, type) {
        if (!userData) return 0;
        const id = this.userData ? this.userData.username : null;
        if (userData.username === id) {
            if (type === 'clicks') return this.userData.clicks || 0;
            if (type === 'money') return this.userData.money || 0;
            if (type === 'playtime') return this.userData.playtime || 0;
        }
        const raw = type === 'clicks' ? userData.clicks : type === 'money' ? userData.money : userData.playtime;
        return typeof raw === 'number' && isFinite(raw) ? raw : 0;
    }

    // Один запрос профиля БЕЗ внутренних повторов (повторы делает вызывающий код).
    // База периодически тормозит на отдельных записях, поэтому «не ответил» —
    // это нормальная ситуация, которую нужно пережить, а не выбросить игрока.
    async _fetchPlayerEntry(id, ms) {
        const userData = await this._restGetOnce('/users/' + id + '.json', ms);
        if (!userData || typeof userData !== 'object') return null;
        return {
            id,
            username: (userData.settings && userData.settings.displayName) || userData.username || 'Игрок',
            value: this._leaderboardValue(userData, this._leaderboardType),
            realUsername: userData.username
        };
    }

    // Один проход по списку игроков
    async _fetchEntriesPass(ids, perUserTimeout, concurrency) {
        const entries = [];
        const missed = [];
        const self = this;
        let cursor = 0;

        async function worker() {
            while (cursor < ids.length) {
                const id = ids[cursor++];
                try {
                    const entry = await self._fetchPlayerEntry(id, perUserTimeout);
                    if (entry) entries.push(entry);
                    else missed.push(id);
                } catch (e) {
                    missed.push(id);      // запомним и попробуем ещё раз
                }
            }
        }

        const workers = [];
        for (let i = 0; i < Math.min(concurrency, ids.length); i++) workers.push(worker());
        await Promise.all(workers);
        return { entries, missed };
    }

    // Чтение игроков в несколько проходов.
    // Замеры базы показали: профиль читается за 100-400 мс, но примерно каждый
    // 15-й запрос зависает и не отвечает вообще. Поэтому:
    //  - таймаут КОРОТКИЙ: успешный ответ приходит за 0.2 с, всё что дольше —
    //    это зависание, и ждать его бессмысленно;
    //  - неудачные не выбрасываем, а опрашиваем снова;
    //  - результат показываем после каждого прохода, чтобы список появлялся
    //    сразу, а не через 20 секунд.
    async _fetchLeaderboardEntries(ids, failed) {
        let entries = [];
        let pending = ids.slice();
        const plan = [
            { timeout: 2500, concurrency: 6 },
            { timeout: 2500, concurrency: 4 },
            { timeout: 3000, concurrency: 3 },
            { timeout: 3000, concurrency: 2 }
        ];

        for (let pass = 0; pass < plan.length && pending.length > 0; pass++) {
            const step = plan[pass];
            const result = await this._fetchEntriesPass(pending, step.timeout, step.concurrency);
            entries = entries.concat(result.entries);
            pending = result.missed;

            this._leaderboardFailed = pending.length;

            // Показываем то, что уже есть, чтобы игрок не ждал конца всех проходов
            if (entries.length > 0 && pending.length > 0) {
                this._renderLeaderboard(entries.slice(), this._leaderboardType, { count: pending.length });
            }
            // Между проходами даём базе передохнуть
            if (pending.length > 0 && pass < plan.length - 1) await new Promise(r => setTimeout(r, 300));
        }

        failed.count = pending.length;
        return entries;
    }

    // ===== КЭШ ТАБЛИЦЫ ЛИДЕРОВ =====
    // Версия в ключе: если формат записей изменится, старый кэш не подхватится.
    _loadLeaderboardCache() {
        try {
            const raw = localStorage.getItem('dilicLeaderboardCache_v1');
            if (!raw) return null;
            const data = JSON.parse(raw);
            return (data && typeof data === 'object') ? data : null;
        } catch (e) { return null; }
    }

    _saveLeaderboardCache() {
        try {
            localStorage.setItem('dilicLeaderboardCache_v1', JSON.stringify(this._leaderboardCache || {}));
        } catch (e) { /* localStorage может быть недоступен или переполнен */ }
    }

    // Одна запись кэша: свежие данные заменяют старые, но если свежих по игроку
    // нет (не ответил) — остаётся прошлое значение. Так список не «худеет».
    _rememberLeaderboardEntries(entries, type) {
        this._leaderboardCache = this._leaderboardCache || {};
        const byId = {};
        const previous = this._leaderboardCache[type] || [];
        for (const e of previous) byId[e.id] = e;
        for (const e of entries) byId[e.id] = e;      // свежие перекрывают старые
        this._leaderboardCache[type] = Object.values(byId);
        this._saveLeaderboardCache();
    }

    _renderLeaderboard(entries, type, failed) {
        entries.sort((a, b) => b.value - a.value);
        const top = entries.slice(0, 50);
        const myName = localStorage.getItem('currentUser');
        this.leaderboardBody.innerHTML = '';
        top.forEach((entry, index) => {
            const row = document.createElement('tr');
            let medal = '';
            if (index === 0) medal = '🥇'; else if (index === 1) medal = '🥈'; else if (index === 2) medal = '🥉';
            row.innerHTML = `<td style="width: 60px;">${medal ? medal : index + 1}</td><td class="leaderboard-player" data-id="${entry.id}" style="cursor: pointer;">${entry.username} ${entry.realUsername === myName ? '👑' : ''}</td><td>${this.formatLeaderboardValue(entry.value, type)}</td>`;
            const playerCell = row.querySelector('.leaderboard-player');
            if (playerCell) playerCell.addEventListener('click', (e) => { e.stopPropagation(); this.showPlayerProfile(entry.id, entry.username); });
            if (entry.realUsername === myName) { row.style.background = 'rgba(255,215,0,0.1)'; row.style.border = '1px solid gold'; }
            this.leaderboardBody.appendChild(row);
        });
        // Если часть профилей не открылась — честно говорим об этом, а не показываем
        // неполный список как полный
        if (failed && failed.count > 0) {
            const note = document.createElement('tr');
            note.innerHTML = `<td colspan="3" class="empty-history">Часть игроков не загрузилась (${failed.count})</td>`;
            this.leaderboardBody.appendChild(note);
        }
    }

    // Обёртка с таймаутом: промис Firebase отменить нельзя, поэтому просто
    // перестаём его ждать (запрос долетит в фоне и попадёт в кэш).
    _withTimeout(promise, ms) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                reject(new Error('timeout ' + ms + 'ms'));
            }, ms);
            promise.then(
                (value) => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } },
                (error) => { if (!settled) { settled = true; clearTimeout(timer); reject(error); } }
            );
        });
    }

    // Адрес базы для прямых REST-запросов.
    // Берём сразу из нескольких источников: firebase.app().options в некоторых
    // сборках пустой, поэтому первым делом смотрим на firebaseConfig из
    // firebase-config.js — он гарантированно содержит databaseURL.
    _dbBaseUrl() {
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
    }

    // Один HTTPS-запрос к базе, без повторов внутри.
    _restGetOnce(path, ms) {
        const base = this._dbBaseUrl();
        if (!base) return Promise.reject(new Error('не удалось определить адрес базы'));
        return this._withTimeout(fetch(base + path, { cache: 'no-store' }), ms).then((res) => {
            if (!res.ok) throw new Error('сервер ответил ' + res.status);
            return res.text();
        }).then((text) => (text ? JSON.parse(text) : null));
    }

    // Чтение с одной повторной попыткой: база периодически подтормаживает.
    async _restGet(path, ms) {
        let lastError = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                return await this._restGetOnce(path, ms);
            } catch (e) {
                lastError = e;
                if (attempt === 1) {
                    console.warn('Запрос к базе не удался (' + (e && e.message) + '), повторяю:', path);
                    await new Promise(r => setTimeout(r, 400));
                }
            }
        }
        throw lastError;
    }

    // Список ID всех игроков (REST ?shallow=true) — без скачивания их данных.
    // Именно этот маленький запрос отвечает быстрее всего (130 мс), но и он
    // изредка подвисает, поэтому пробуем несколько раз: без списка таблица
    // не построится вообще.
    async _fetchUserIds(attempts = 3) {
        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                const data = await this._restGetOnce('/users.json?shallow=true', 4000);
                if (data && typeof data === 'object') {
                    const ids = Object.keys(data);
                    if (ids.length > 0) return ids;
                    console.warn('Список игроков пуст — в базе нет пользователей?');
                    return [];
                }
            } catch (e) {
                console.warn('Список игроков не получен (попытка ' + attempt + ' из ' + attempts + '):', e && e.message);
                if (attempt < attempts) await new Promise(r => setTimeout(r, 400));
            }
        }
        console.warn('Не удалось получить список игроков | адрес базы:', this._dbBaseUrl());
        return [];
    }
    
    formatLeaderboardValue(value, type) {
        if (type === 'playtime') { const hours = Math.floor(value / 3600); const minutes = Math.floor((value % 3600) / 60); return `${hours}ч ${minutes}м`; }
        return value.toLocaleString();
    }
    
    // Обновление интерфейса с кэшем значений: в DOM пишем только то, что реально
    // изменилось. Раньше на каждый клик выполнялось 4× toLocaleString() и ~8 записей
    // в DOM, даже если числа те же. Метод синхронный — раньше он был async без await,
    // что создавало лишний Promise на каждый клик.
    updateUI() {
        if (!this.userData) return;
        const cache = this._uiCache;

        const displayName = this.userData.settings?.displayName || this.userData.username;
        if (this.usernameDisplay && cache.username !== displayName) {
            this.usernameDisplay.textContent = displayName;
            cache.username = displayName;
        }
        if (this.moneySpan && cache.money !== this.userData.money) {
            this.moneySpan.textContent = this.formatNumber(this.userData.money);
            cache.money = this.userData.money;
        }
        if (this.dilicksSpan && cache.dilicks !== this.userData.dilicks) {
            this.dilicksSpan.textContent = this.formatNumber(this.userData.dilicks);
            cache.dilicks = this.userData.dilicks;
        }
        if (this.clicksSpan && cache.clicks !== this.userData.clicks) {
            this.clicksSpan.textContent = this.formatNumber(this.userData.clicks);
            cache.clicks = this.userData.clicks;
        }
        if (this.clickPowerSpan) {
            const power = this.userData.clickPower * this.getSkinMultiplier(this.userData.currentSkin);
            if (cache.clickPower !== power) {
                this.clickPowerSpan.textContent = power;
                cache.clickPower = power;
            }
        }
        if (this.wheel && this.wheel.balanceSpan && cache.wheelBalance !== this.userData.dilicks) {
            this.wheel.balanceSpan.textContent = this.formatNumber(this.userData.dilicks);
            cache.wheelBalance = this.userData.dilicks;
        }
        this.updatePlaytimeDisplay();
        // Прогресс-бар сезона — через общий батч, без полного обновления вкладки
        this.scheduleSeasonBarSync();
        // Профиль обновляем, только если вкладка действительно открыта
        const profileTab = document.getElementById('profile');
        if (profileTab && profileTab.classList.contains('active')) this.updateProfile();
    }
    
    // Сохранение в Firebase с коалесценцией: раньше одна полная запись всего профиля
    // уходила в базу НА КАЖДЫЙ КЛИК (при 10 кликах/с — 10 записей/с). Теперь изменения
    // собираются и отправляются не чаще раза в 2 секунды, плюс принудительный сброс
    // при сворачивании Telegram/уходе со страницы, чтобы прогресс не терялся.
    async saveGame(immediate) {
        this._savePending = true;
        if (immediate) { this.flushSaveNow(); return; }
        if (!this._saveTimer) {
            this._saveTimer = setTimeout(() => {
                this._saveTimer = null;
                this._flushSave();
            }, 2000);
        }
        this._bindSaveFlush();
    }

    _bindSaveFlush() {
        if (this._saveBound) return;
        this._saveBound = true;
        const flush = () => this.flushSaveNow();
        window.addEventListener('pagehide', flush);
        window.addEventListener('beforeunload', flush);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flush();
        });
    }

    // Немедленный сброс отложенного сохранения (важные покупки, уход со страницы)
    flushSaveNow() {
        if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
        if (this._saveRetryTimer) { clearTimeout(this._saveRetryTimer); this._saveRetryTimer = null; }
        if (this._savePending) this._flushSave();
    }

    // Если запись не прошла (пропала сеть), повторяем — иначе прогресс остался бы
    // несохранённым до следующего действия игрока.
    _scheduleSaveRetry() {
        if (this._saveRetryTimer || !this.isLoaded) return;
        this._saveRetryTimer = setTimeout(() => {
            this._saveRetryTimer = null;
            if (this._savePending) this._flushSave();
        }, 5000);
    }

    _flushSave() {
        const userId = localStorage.getItem('userId');
        if (!userId || !this.isLoaded || !this.userData) { this._savePending = true; return; }
        this._savePending = false;
        try {
            firebase.database().ref('users/' + userId).update(this.userData)
                .catch((error) => { console.error('❌ Ошибка сохранения:', error); this._savePending = true; this._scheduleSaveRetry(); });
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            this._savePending = true;
            this._scheduleSaveRetry();
        }
    }
    
    async logout() {
        if (this.bubbleFrame) cancelAnimationFrame(this.bubbleFrame);
        if (this._bubbleIdleTimer) clearTimeout(this._bubbleIdleTimer);
        if (this.autoClickerInterval) clearInterval(this.autoClickerInterval);
        if (this.playtimeInterval) clearInterval(this.playtimeInterval);
        if (this.questTimerInterval) clearInterval(this.questTimerInterval);
        if (this.banTimerInterval) clearInterval(this.banTimerInterval);
        if (this.maintenanceTimerInterval) clearInterval(this.maintenanceTimerInterval);
        if (this._seasonBarFrame) cancelAnimationFrame(this._seasonBarFrame);
        if (this._eventFlushTimer) { clearTimeout(this._eventFlushTimer); this._eventFlushTimer = null; }
        this.flushEventContribution();     // не теряем вклад в ивент
        this.flushSaveNow();               // и не теряем прогресс
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        window.location.href = 'register.html';
    }
    
    createBubble() {
        // Раньше здесь был querySelectorAll('.bubble') на каждое создание пузыря —
        // полный обход DOM. Теперь считаем собственные ссылки.
        if (this._bubbleCount === undefined) this._bubbleCount = 0;
        if (this._bubbleCount > 10) return;
        this._bubbleCount++;
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const isMobile = window.innerWidth <= 768;
        const size = isMobile ? Math.random() * 30 + 10 : Math.random() * 50 + 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.bottom = '-50px';
        const duration = isMobile ? 3 + Math.random() * 2 : 4 + Math.random() * 3;
        bubble.style.animationDuration = duration + 's';
        document.body.appendChild(bubble);
        setTimeout(() => {
            if (bubble.parentNode) bubble.remove();
            if (this._bubbleCount > 0) this._bubbleCount--;
        }, duration * 1000);
    }
    
    startBubbles() {
        // Пузыри создаются в простое: rAF-цикл, который раньше крутился постоянно
        // (60 вызовов в секунду ради одного пузыря раз в 2.5 с), больше не нужен.
        const bubbleInterval = 2500;
        const tick = () => {
            if (!this.isLoaded) { this._bubbleIdleTimer = setTimeout(tick, bubbleInterval); return; }
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(() => this.createBubble(), { timeout: 1000 });
            } else {
                this.createBubble();
            }
            this._bubbleIdleTimer = setTimeout(tick, bubbleInterval);
        };
        if (this._bubbleIdleTimer) clearTimeout(this._bubbleIdleTimer);
        this._bubbleIdleTimer = setTimeout(tick, bubbleInterval);
    }
    
    checkAchievements() {
        if (!this.userData.completedAchievements) this.userData.completedAchievements = [];
        let newAchievementUnlocked = false;
        this.achievementsData.forEach(achievement => {
            const isCompleted = this.userData.completedAchievements.includes(achievement.id);
            const canComplete = achievement.condition(this.userData);
            if (canComplete && !isCompleted) {
                this.userData.completedAchievements.push(achievement.id);
                this.userData.money += achievement.reward.money;
                this.userData.dilicks += achievement.reward.dilicks;
                newAchievementUnlocked = true;
                this.showAchievementNotification(achievement);
            }
        });
        if (newAchievementUnlocked) { this.saveGame(); this.updateUI(); if (document.getElementById('profile')?.classList.contains('active')) this.updateProfile(); }
    }
    
    updateProfile() {
        if (!this.profileUsername) return;
        const displayName = this.userData.settings?.displayName || this.userData.username;
        this.profileUsername.textContent = displayName;
        this.profileLevel.textContent = this.userData.seasonLevel;
        this.profileClicks.textContent = this.userData.clicks.toLocaleString();
        this.profileMoney.textContent = this.userData.money.toLocaleString();
        this.profileDilicks.textContent = this.userData.dilicks.toLocaleString();
        const hours = Math.floor(this.userData.playtime / 3600);
        const minutes = Math.floor((this.userData.playtime % 3600) / 60);
        this.profilePlaytime.textContent = `${hours}ч ${minutes}м`;
        if (this.profileAvatar && this.userData.currentSkin) this.profileAvatar.src = this.skinsData[this.userData.currentSkin].image;
        this.renderAchievements();
        this.updateSkinStats();
    }
    
    renderAchievements() {
        if (!this.achievementsGrid) return;
        this.achievementsGrid.innerHTML = '';
        this.achievementsData.forEach(achievement => {
            const isCompleted = this.userData.completedAchievements?.includes(achievement.id);
            const progress = this.calculateAchievementProgress(achievement);
            const card = document.createElement('div');
            card.className = `achievement-card ${isCompleted ? 'completed' : ''}`;
            card.innerHTML = `<div class="achievement-icon ${!isCompleted ? 'locked' : ''}"><img src="${achievement.icon}" alt="${achievement.name}"></div><h3 class="achievement-title">${achievement.name}</h3><p class="achievement-desc">${achievement.description}</p><div class="achievement-progress"><div class="achievement-progress-bar"><div class="achievement-progress-fill" style="width: ${progress}%"></div></div><div class="achievement-progress-text">${isCompleted ? 'Выполнено' : `${Math.round(progress)}%`}</div></div>`;
            this.achievementsGrid.appendChild(card);
        });
    }
    
    calculateAchievementProgress(achievement) {
        if (this.userData.completedAchievements?.includes(achievement.id)) return 100;
        switch(achievement.id) {
            case 'firstClick': return Math.min(100, (this.userData.clicks / 1) * 100);
            case 'clicker100': return Math.min(100, (this.userData.clicks / 100) * 100);
            case 'clicker1000': return Math.min(100, (this.userData.clicks / 1000) * 100);
            case 'clicker10000': return Math.min(100, (this.userData.clicks / 10000) * 100);
            case 'clicker100000': return Math.min(100, (this.userData.clicks / 100000) * 100);
            case 'richMan': return Math.min(100, (this.userData.money / 10000) * 100);
            case 'millionaire': return Math.min(100, (this.userData.money / 1000000) * 100);
            case 'dilicMaster': return Math.min(100, (this.userData.dilicks / 5000) * 100);
            case 'dilicLord': return Math.min(100, (this.userData.dilicks / 50000) * 100);
            case 'skinCollector': const totalSkins = Object.keys(this.skinsData).length; const owned = this.userData.inventory?.length || 0; return Math.min(100, (owned / totalSkins) * 100);
            case 'critMaster': return Math.min(100, (this.userData.critChance / 50) * 100);
            case 'critGod': return Math.min(100, (this.userData.critChance / 100) * 100);
            case 'autoClickerMaster': return Math.min(100, (this.userData.autoClickerLevel / 10) * 100);
            case 'autoClickerGod': return Math.min(100, (this.userData.autoClickerLevel / 50) * 100);
            case 'wheelMaster': return this.userData.inventory?.includes('wheel_dragon_skin') ? 100 : 0;
            case 'uraganKing': return this.userData.inventory?.includes('uragan_dragon_top3') ? 100 : 0;
            case 'uraganLord': return this.userData.inventory?.includes('uragan_holo_top10') ? 100 : 0;
            default: return 0;
        }
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        let rewardText = '';
        if (achievement.reward.money > 0) rewardText += `+${achievement.reward.money} ${this.getMoneyIcon()} `;
        if (achievement.reward.dilicks > 0) rewardText += `+${achievement.reward.dilicks} ${this.getDilicksIcon()}`;
        notification.innerHTML = `<div class="notification-icon"><img src="${achievement.icon}" alt="${achievement.name}"></div><div class="notification-content"><h4>Достижение получено!</h4><p>${achievement.name}</p><p class="notification-reward">${rewardText}</p></div>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => { notification.classList.remove('show'); setTimeout(() => notification.remove(), 300); }, 3000);
    }
    
    updateSkinStats() {
        if (!this.ownedSkinsList) return;
        const totalSkins = Object.keys(this.skinsData).length;
        const ownedSkins = this.userData.inventory?.length || 0;
        if (this.skinProgressFill) this.skinProgressFill.style.width = (ownedSkins / totalSkins) * 100 + '%';
        if (this.ownedSkins) this.ownedSkins.textContent = ownedSkins;
        if (this.totalSkins) this.totalSkins.textContent = totalSkins;
        this.ownedSkinsList.innerHTML = '';
        Object.entries(this.skinsData).forEach(([skinId, skin]) => {
            if (this.userData.inventory?.includes(skinId)) {
                const skinTag = document.createElement('div');
                skinTag.className = `skin-tag ${this.userData.currentSkin === skinId ? 'active' : ''}`;
                if (skinId === 'uragan_dragon_top3') skinTag.classList.add('skin-uragan-top3');
                if (skinId === 'uragan_holo_top10') skinTag.classList.add('skin-uragan-top10');
                if (skinId === 'uragan_banana_top50') skinTag.classList.add('skin-uragan-top50');
                if (skinId === 'uragan_cursor_top100') skinTag.classList.add('skin-uragan-top100');
                skinTag.innerHTML = `<img src="${skin.image}" alt="${skin.name}"><span>${skin.name}</span>`;
                this.ownedSkinsList.appendChild(skinTag);
            }
        });
    }
    
    activatePromocode() {
        if (!this.promocodeInput) return;
        const code = this.promocodeInput.value.trim().toUpperCase();
        if (!code) { this.showPromocodeMessage('Введите промокод', 'error'); return; }
        const promocode = this.promocodesData[code];
        if (!promocode) { this.showPromocodeMessage('Промокод не найден', 'error'); return; }
        if (promocode.expiryDate && Date.now() > promocode.expiryDate) { this.showPromocodeMessage('Срок истек', 'error'); return; }
        if (this.userData.activatedPromocodes && this.userData.activatedPromocodes.includes(code)) { this.showPromocodeMessage('Уже активировали', 'error'); return; }
        let rewardMessage = '';
        if (promocode.reward.money > 0) { this.userData.money += promocode.reward.money; rewardMessage += `+${promocode.reward.money.toLocaleString()} ${this.getMoneyIcon()} `; }
        if (promocode.reward.dilicks > 0) { this.userData.dilicks += promocode.reward.dilicks; rewardMessage += `+${promocode.reward.dilicks.toLocaleString()} ${this.getDilicksIcon()} `; }
        if (promocode.reward.skin) {
            const skinId = promocode.reward.skin;
            if (this.skinsData[skinId] && !this.userData.inventory.includes(skinId)) { this.userData.inventory.push(skinId); rewardMessage += `+скин "${this.skinsData[skinId].name}" ✨`; }
            else { this.userData.dilicks += 100; rewardMessage += `+100 ${this.getDilicksIcon()}`; }
        }
        if (!this.userData.activatedPromocodes) this.userData.activatedPromocodes = [];
        this.userData.activatedPromocodes.push(code);
        if (!this.userData.promocodesHistory) this.userData.promocodesHistory = [];
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()}`;
        this.userData.promocodesHistory.push({ code, reward: promocode.reward, date: dateStr, timestamp: Date.now() });
        this.saveGame();
        this.updateUI();
        this.updateInventory();
        this.updatePromocodesList();
        this.updatePromocodesHistory();
        this.showPromocodeMessage(`Промокод активирован! ${rewardMessage}`, 'success');
        this.promocodeInput.value = '';
        this.checkAchievements();
    }
    
    showPromocodeMessage(text, type) {
        if (!this.promocodeMessage) return;
        this.promocodeMessage.innerHTML = text;
        this.promocodeMessage.className = 'promocode-message ' + type;
        setTimeout(() => { if (this.promocodeMessage) { this.promocodeMessage.innerHTML = ''; this.promocodeMessage.className = 'promocode-message'; } }, 3000);
    }
    
    updatePromocodesList() {
        if (!this.promocodesList) return;
        this.promocodesList.innerHTML = '';
        Object.values(this.promocodesData).forEach(promocode => {
            const isActivated = this.userData.activatedPromocodes?.includes(promocode.code);
            const isExpired = promocode.expiryDate && Date.now() > promocode.expiryDate;
            if (isActivated || isExpired) return;
            const item = document.createElement('div');
            item.className = 'promocode-item';
            const rewardParts = [];
            if (promocode.reward.money > 0) rewardParts.push(`${this.getMoneyIcon()} +${promocode.reward.money.toLocaleString()}`);
            if (promocode.reward.dilicks > 0) rewardParts.push(`${this.getDilicksIcon()} +${promocode.reward.dilicks.toLocaleString()}`);
            if (promocode.reward.skin) rewardParts.push(`✨ +скин`);
            item.innerHTML = `<div class="promocode-code">${promocode.code}</div><div class="promocode-reward">${rewardParts.join(' ')}</div>`;
            item.addEventListener('click', () => { if (this.promocodeInput) { this.promocodeInput.value = promocode.code; this.promocodeInput.focus(); } });
            this.promocodesList.appendChild(item);
        });
        if (this.promocodesList.children.length === 0) { const empty = document.createElement('div'); empty.className = 'empty-history'; empty.textContent = 'Нет доступных промокодов'; this.promocodesList.appendChild(empty); }
    }
    
    updatePromocodesHistory() {
        if (!this.promocodesHistory) return;
        this.promocodesHistory.innerHTML = '';
        const history = this.userData.promocodesHistory || [];
        if (history.length === 0) { const empty = document.createElement('div'); empty.className = 'empty-history'; empty.textContent = 'История пуста'; this.promocodesHistory.appendChild(empty); return; }
        const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
        sortedHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const rewardParts = [];
            if (item.reward.money > 0) rewardParts.push(`${this.getMoneyIcon()} +${item.reward.money.toLocaleString()}`);
            if (item.reward.dilicks > 0) rewardParts.push(`${this.getDilicksIcon()} +${item.reward.dilicks.toLocaleString()}`);
            if (item.reward.skin) rewardParts.push(`✨ +скин`);
            historyItem.innerHTML = `<div class="history-code">${item.code}</div><div class="history-reward">${rewardParts.join(' ')}</div><div class="history-date">${item.date}</div>`;
            this.promocodesHistory.appendChild(historyItem);
        });
    }
    
    async checkCompensation() {
        if (this.userData.compensationReceived) return;
        const hasOldCollector = this.userData.completedAchievements && this.userData.completedAchievements.includes('skinCollector');
        const currentSkinCount = this.userData.inventory?.length || 0;
        if ((hasOldCollector || currentSkinCount >= 4) && !this.userData.compensationReceived) this.showCompensationDialog();
    }
    
    showCompensationDialog() {
        if (this.compensationShown) return;
        this.compensationShown = true;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'compensationModal';
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
        modal.innerHTML = `<div class="modal-content" style="max-width:450px;background:rgba(20,25,35,0.95);border:2px solid gold;border-radius:50px;padding:30px;text-align:center;"><h2 style="color:gold;font-size:2rem;margin-bottom:20px;">🎁 БОНУС ОБНОВЛЕНИЯ</h2><div style="margin:20px 0;"><img src="${this.DILICKS_ICON}" style="width:60px;height:60px;border-radius:50%;margin-bottom:15px;"><p style="color:white;font-size:1.2rem;margin-bottom:10px;">В игру добавлены новые скины!</p><div style="background:rgba(255,215,0,0.1);border-radius:30px;padding:15px;margin-bottom:20px;"><span style="color:gold;font-size:2rem;font-weight:bold;">+4500</span><img src="${this.DILICKS_ICON}" style="width:30px;height:30px;border-radius:50%;margin-left:10px;"></div></div><div style="display:flex;gap:15px;justify-content:center;"><button class="modal-btn confirm" id="claimCompensation" style="background:rgba(76,175,80,0.2);border:1px solid #4CAF50;color:white;padding:12px 30px;border-radius:40px;font-weight:bold;cursor:pointer;">ПОЛУЧИТЬ</button><button class="modal-btn cancel" id="closeCompensation" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:12px 30px;border-radius:40px;font-weight:bold;cursor:pointer;">ПОЗЖЕ</button></div></div>`;
        document.body.appendChild(modal);
        document.getElementById('claimCompensation').addEventListener('click', () => { this.claimCompensation(); modal.remove(); });
        document.getElementById('closeCompensation').addEventListener('click', () => { modal.remove(); });
    }
    
    async claimCompensation() {
        this.userData.dilicks += 4500;
        this.userData.compensationReceived = true;
        await this.saveGame(true);   // выдаётся один раз — сохраняем сразу
        this.updateUI();
        this.showToast(`✅ +4500 ${this.getDilicksIcon()} получено!`, 'success');
    }
    
    checkIfCreator() {
        const userId = localStorage.getItem('userId');
        const adminBtn = document.getElementById('adminLinkBtn');
        if (userId === this.CREATOR_ID && adminBtn) adminBtn.style.display = 'inline-block';
    }
}

// ============================================
// КЛАСС НАСТРОЕК
// ============================================
class Settings {
    constructor(game) { this.game = game; this.init(); }
    init() { this.loadSettings(); this.setupEventListeners(); this.updateUI(); }
    loadSettings() {
        if (!this.game.userData.settings) this.game.userData.settings = { displayName: this.game.userData.username, theme: 'dark', notifications: true, sound: true, animations: true, language: 'ru', performanceMode: false };
    }
    setupEventListeners() {
        const saveDisplayName = document.getElementById('saveDisplayName');
        if (saveDisplayName) saveDisplayName.addEventListener('click', () => this.saveDisplayName());
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => this.changePassword());
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.addEventListener('change', (e) => this.saveTheme(e.target.value));
        const notificationsEnabled = document.getElementById('notificationsEnabled');
        if (notificationsEnabled) notificationsEnabled.addEventListener('change', (e) => { this.game.userData.settings.notifications = e.target.checked; this.game.saveGame(); });
        const soundEnabled = document.getElementById('soundEnabled');
        if (soundEnabled) soundEnabled.addEventListener('change', (e) => { this.game.userData.settings.sound = e.target.checked; this.game.saveGame(); });
        const animationsEnabled = document.getElementById('animationsEnabled');
        if (animationsEnabled) animationsEnabled.addEventListener('change', (e) => { this.game.userData.settings.animations = e.target.checked; this.game.saveGame(); });
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) languageSelect.addEventListener('change', (e) => this.saveLanguage(e.target.value));
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) exportDataBtn.addEventListener('click', () => this.exportData());
        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) importDataBtn.addEventListener('click', () => this.importData());
        const resetProgressBtn = document.getElementById('resetProgressBtn');
        if (resetProgressBtn) resetProgressBtn.addEventListener('click', () => this.confirmResetProgress());
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', () => this.confirmDeleteAccount());
        const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
        if (checkUpdatesBtn) checkUpdatesBtn.addEventListener('click', () => this.checkUpdates());
    }
    updateUI() {
        const displayNameInput = document.getElementById('displayName');
        if (displayNameInput) displayNameInput.value = this.game.userData.settings.displayName || this.game.userData.username;
        const usernameInput = document.getElementById('username');
        if (usernameInput) usernameInput.value = this.game.userData.username;
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.game.userData.settings.theme || 'dark';
        const notificationsEnabled = document.getElementById('notificationsEnabled');
        if (notificationsEnabled) notificationsEnabled.checked = this.game.userData.settings.notifications !== false;
        const soundEnabled = document.getElementById('soundEnabled');
        if (soundEnabled) soundEnabled.checked = this.game.userData.settings.sound !== false;
        const animationsEnabled = document.getElementById('animationsEnabled');
        if (animationsEnabled) animationsEnabled.checked = this.game.userData.settings.animations !== false;
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) languageSelect.value = this.game.userData.settings.language || 'ru';
        const perfCheckbox = document.getElementById('performanceMode');
        if (perfCheckbox) perfCheckbox.checked = this.game.userData.settings.performanceMode || false;
    }
    async saveDisplayName() {
        const input = document.getElementById('displayName');
        const newName = input.value.trim();
        if (!newName) { this.game.showToast('❌ Введите никнейм', 'error'); return; }
        if (newName.length > 20) { this.game.showToast('❌ Максимум 20 символов', 'error'); return; }
        this.game.userData.settings.displayName = newName;
        await this.game.saveGame();
        const profileUsername = document.getElementById('profileUsername');
        if (profileUsername) profileUsername.textContent = newName;
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) usernameDisplay.textContent = newName;
        this.game.showToast(`✅ Никнейм изменён на "${newName}"`, 'success');
    }
    async changePassword() {
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        if (!oldPass || !newPass || !confirmPass) { this.game.showToast('❌ Заполните все поля', 'error'); return; }
        if (newPass !== confirmPass) { this.game.showToast('❌ Пароли не совпадают', 'error'); return; }
        if (newPass.length < 4) { this.game.showToast('❌ Минимум 4 символа', 'error'); return; }
        if (oldPass !== this.game.userData.password) { this.game.showToast('❌ Неверный пароль', 'error'); return; }
        this.game.userData.password = newPass;
        await this.game.saveGame();
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.game.showToast('✅ Пароль изменён', 'success');
    }
    saveTheme(theme) {
        this.game.userData.settings.theme = theme;
        this.game.saveGame();
        if (theme === 'light') document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        else if (theme === 'dark') document.body.style.background = 'linear-gradient(135deg, #0a0c15 0%, #121520 50%, #0a0c15 100%)';
        else { if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.body.style.background = 'linear-gradient(135deg, #0a0c15 0%, #121520 50%, #0a0c15 100%)'; else document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'; }
        this.game.showToast(`✅ Тема изменена`, 'success');
    }
    async saveLanguage(lang) {
        this.game.userData.settings.language = lang;
        await this.game.saveGame();
        this.game.showToast(`✅ Язык изменён`, 'success');
    }
    exportData() {
        try {
            const exportData = { username: this.game.userData.username, displayName: this.game.userData.settings?.displayName || this.game.userData.username, clicks: this.game.userData.clicks, money: this.game.userData.money, dilicks: this.game.userData.dilicks, clickPower: this.game.userData.clickPower, autoClickerLevel: this.game.userData.autoClickerLevel, critChance: this.game.userData.critChance, inventory: this.game.userData.inventory, currentSkin: this.game.userData.currentSkin, seasonLevel: this.game.userData.seasonLevel, seasonExp: this.game.userData.seasonExp, playtime: this.game.userData.playtime, completedAchievements: this.game.userData.completedAchievements, compensationReceived: this.game.userData.compensationReceived, rechargeBonus: this.game.userData.rechargeBonus || 0, clickerMastery: this.game.userData.clickerMastery || 0, eventBooster: this.game.userData.eventBooster || 0, settings: this.game.userData.settings, exportDate: new Date().toLocaleString() };
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date();
            link.download = `dilic_clicker_${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.game.showToast('✅ Данные экспортированы', 'success');
        } catch (error) { console.error(error); this.game.showToast('❌ Ошибка экспорта', 'error'); }
    }
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!confirm('⚠️ Импорт заменит прогресс. Продолжить?')) return;
            try {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        if (!this.validateImportedData(importedData)) { this.game.showToast('❌ Неверный формат', 'error'); return; }
                        importedData.username = this.game.userData.username;
                        importedData.password = this.game.userData.password;
                        this.game.userData = importedData;
                        await this.game.saveGame(true);   // импорт нельзя терять при закрытии
                        this.updateUI();
                        this.game.updateUI();
                        this.game.updateInventory();
                        this.game.updateShopStatus();
                        this.game.renderUpgrades();
                        this.game.showToast('✅ Данные импортированы', 'success');
                    } catch (parseError) { this.game.showToast('❌ Ошибка чтения', 'error'); }
                };
                reader.readAsText(file);
            } catch (error) { console.error(error); this.game.showToast('❌ Ошибка импорта', 'error'); }
        };
        input.click();
    }
    validateImportedData(data) {
        const requiredFields = ['clicks', 'money', 'dilicks', 'clickPower', 'inventory', 'currentSkin'];
        for (const field of requiredFields) if (!(field in data)) return false;
        if (typeof data.clicks !== 'number' || typeof data.money !== 'number' || typeof data.dilicks !== 'number') return false;
        if (!Array.isArray(data.inventory)) return false;
        return true;
    }
    confirmResetProgress() { this.showModal('🔄 Сброс прогресса', 'Сбросить весь прогресс?', () => this.resetProgress()); }
    async resetProgress() {
        const username = this.game.userData.username;
        const password = this.game.userData.password;
        const resetData = { clicks: 0, money: 1000, dilicks: 500, clickPower: 1, autoClickerLevel: 0, critChance: 5, inventory: ['classic'], currentSkin: 'classic', seasonLevel: 1, seasonExp: 0, playtime: 0, seasonClaimed: { free: [], premium: [] }, premiumPass: false, completedAchievements: [], activatedPromocodes: [], promocodesHistory: [], compensationReceived: false, rechargeBonus: 0, clickerMastery: 0, eventBooster: 0, settings: this.game.userData.settings, lastSave: Date.now(), username, password };
        this.game.userData = resetData;
        await this.game.saveGame(true);   // сброс прогресса пишем сразу
        this.game.updateUI();
        this.game.updateInventory();
        this.game.updateShopStatus();
        this.game.renderUpgrades();
        this.game.updateSeasonUI();
        this.updateUI();
        this.game.showToast('✅ Прогресс сброшен', 'success');
    }
    confirmDeleteAccount() { this.showModal('🗑️ Удаление аккаунта', 'Удалить аккаунт навсегда?', () => this.deleteAccount()); }
    async deleteAccount() {
        const userId = localStorage.getItem('userId');
        if (userId) await firebase.database().ref('users/' + userId).remove();
        if (this.game.bubbleFrame) cancelAnimationFrame(this.game.bubbleFrame);
        if (this.game.autoClickerInterval) clearInterval(this.game.autoClickerInterval);
        if (this.game.playtimeInterval) clearInterval(this.game.playtimeInterval);
        if (this.game.questTimerInterval) clearInterval(this.game.questTimerInterval);
        localStorage.clear();
        window.location.href = 'register.html';
    }
    checkUpdates() { this.game.showToast('🔄 Установлена последняя версия 3.0.0 ULTRA', 'info'); }
    showModal(title, message, onConfirm) {
        const oldModal = document.querySelector('.modal-overlay');
        if (oldModal) oldModal.remove();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal-content"><h3>${title}</h3><p>${message}</p><div class="modal-buttons"><button class="modal-btn confirm">Да, подтверждаю</button><button class="modal-btn cancel">Отмена</button></div></div>`;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        modal.querySelector('.confirm').addEventListener('click', () => { onConfirm(); modal.classList.remove('active'); setTimeout(() => modal.remove(), 300); });
        modal.querySelector('.cancel').addEventListener('click', () => { modal.classList.remove('active'); setTimeout(() => modal.remove(), 300); });
    }
}

// ============================================
// КЛАСС КОЛЕСА ФОРТУНЫ
// ============================================
class WheelOfFortune {
    constructor(game) {
        this.game = game;
        this.PRIZES = [
            { name: '2500 МОНЕТ', value: 2500, type: 'money', prob: 50, color: '#2e7d32' },
            { name: '5500 МОНЕТ', value: 5500, type: 'money', prob: 35, color: '#f9a825' },
            { name: '8500 МОНЕТ', value: 8500, type: 'money', prob: 25, color: '#ef6c00' },
            { name: '11500 МОНЕТ', value: 11500, type: 'money', prob: 15, color: '#d32f2f' },
            { name: '5000 ДИЛИКОВ', value: 5000, type: 'dilicks', prob: 5, color: '#7b1fa2' },
            { name: 'ОСОБЕННЫЙ СКИН', value: 'skin', type: 'skin', prob: 2.5, color: '#c2185b' }
        ];
        this.SPIN_COST = 2500;
        this.MONEY_ICON = 'https://avatars.mds.yandex.net/i?id=d2747e92b4fb93d8cee0b3582cb46ea6_l-5332707-images-thumbs&n=13';
        this.DILICKS_ICON = 'https://i.pinimg.com/736x/df/49/fd/df49fd562d564016dcc4070b5e83c521.jpg';
        this.SKIN_ID = 'wheel_dragon_skin';
        this.rotation = 0;
        this.isSpinning = false;
        this.spinVelocity = 0;
        this.spinDeceleration = 0.985;
        this.spinActive = false;
        this.animationFrame = null;
        this.init();
    }
    init() {
        this.canvas = document.getElementById('wheelCanvas');
        if (this.canvas) this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('wheelSpinBtn');
        this.balanceSpan = document.getElementById('wheelBalance');
        this.resultDisplay = document.getElementById('wheelResultDisplay');
        this.costSpan = document.getElementById('wheelSpinCost');
        this.modal = document.getElementById('skinModal');
        this.setupEventListeners();
        if (this.ctx) this.drawWheel();
        this.updateSpinCost();
    }
    updateSpinCost() {
        firebase.database().ref('events/wheelEvent').once('value', (snap) => {
            const data = snap.val();
            if (data && data.active && data.spinCost) { this.SPIN_COST = data.spinCost; if (this.costSpan) this.costSpan.textContent = this.SPIN_COST; }
        });
    }
    setupEventListeners() {
        if (this.spinBtn) this.spinBtn.addEventListener('click', () => this.spin());
        const showSkinBtn = document.getElementById('showSkinBtn');
        const closeModal = document.getElementById('closeModal');
        if (showSkinBtn) showSkinBtn.addEventListener('click', () => { if (this.modal) this.modal.style.display = 'flex'; });
        if (closeModal) closeModal.addEventListener('click', () => { if (this.modal) this.modal.style.display = 'none'; });
        window.addEventListener('click', (e) => { if (e.target === this.modal && this.modal) this.modal.style.display = 'none'; });
    }
    drawWheel() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.4;
        this.ctx.clearRect(0, 0, w, h);
        let startAngle = this.rotation - Math.PI / 2;
        for (let i = 0; i < this.PRIZES.length; i++) {
            const prize = this.PRIZES[i];
            const sliceAngle = (prize.prob / 100) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy);
            this.ctx.arc(cx, cy, r, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = prize.color;
            this.ctx.shadowColor = 'rgba(255,255,255,0.3)';
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
            startAngle = endAngle;
        }
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r * 0.15, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.shadowColor = 'rgba(255,215,0,0.5)';
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    spin() {
        if (this.isSpinning) return;
        this.updateSpinCost();
        if (this.game.userData.dilicks < this.SPIN_COST) {
            this.resultDisplay.innerHTML = '❌ Недостаточно диликов!';
            this.game.showToast(`❌ Нужно: ${this.SPIN_COST} ${this.game.getDilicksIcon()}`, 'error');
            return;
        }
        this.game.userData.dilicks -= this.SPIN_COST;
        this.balanceSpan.textContent = this.game.userData.dilicks.toLocaleString();
        this.game.updateUI();
        this.game.saveGame();
        this.spinVelocity = 0.45 + Math.random() * 0.3;
        this.spinDeceleration = 0.982 + (Math.random() * 0.01);
        this.spinActive = true;
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.resultDisplay.innerHTML = '⏳ КРУТИТСЯ...';
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => this.spinAnimation());
        if (navigator.vibrate) navigator.vibrate(30);
    }
    spinAnimation() {
        if (!this.spinActive) return;
        this.rotation += this.spinVelocity;
        this.spinVelocity *= this.spinDeceleration;
        this.drawWheel();
        if (this.spinVelocity < 0.002) {
            this.spinActive = false;
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            const normalized = ((this.rotation % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
            let angle = (normalized + Math.PI/2) % (2*Math.PI);
            let cumulative = 0;
            let selectedPrize = this.PRIZES[0];
            for (let prize of this.PRIZES) {
                const slice = (prize.prob / 100) * 2 * Math.PI;
                if (angle >= cumulative && angle < cumulative + slice) { selectedPrize = prize; break; }
                cumulative += slice;
            }
            this.givePrize(selectedPrize);
            return;
        }
        this.animationFrame = requestAnimationFrame(() => this.spinAnimation());
    }
    givePrize(prize) {
        let resultHTML = '';
        if (prize.type === 'skin') {
            if (!this.game.userData.inventory.includes(this.SKIN_ID)) {
                this.game.userData.inventory.push(this.SKIN_ID);
                resultHTML = '✨ ОСОБЕННЫЙ СКИН ✨';
                this.resultDisplay.style.color = '#ffb7c5';
                this.resultDisplay.style.textShadow = '0 0 30px #ff69b4';
                this.game.showToast(`🎉 Вы получили скин дракона x250!`, 'success');
            } else {
                this.game.userData.dilicks += 10000;
                resultHTML = `<span>+10000</span><img src="${this.DILICKS_ICON}" class="wheel-result-icon"><span>(скин уже был)</span>`;
                this.game.showToast(`+10000 ${this.game.getDilicksIcon()}`, 'success');
            }
        } else if (prize.type === 'money') {
            this.game.userData.money += prize.value;
            resultHTML = `<span>+${prize.value.toLocaleString()}</span><img src="${this.MONEY_ICON}" class="wheel-result-icon">`;
            this.game.showToast(`+${prize.value.toLocaleString()} ${this.game.getMoneyIcon()}`, 'success');
        } else {
            this.game.userData.dilicks += prize.value;
            resultHTML = `<span>+${prize.value.toLocaleString()}</span><img src="${this.DILICKS_ICON}" class="wheel-result-icon">`;
            this.game.showToast(`+${prize.value.toLocaleString()} ${this.game.getDilicksIcon()}`, 'success');
        }
        this.resultDisplay.innerHTML = resultHTML;
        this.balanceSpan.textContent = this.game.userData.dilicks.toLocaleString();
        this.game.updateUI();
        this.game.updateInventory();
        this.game.saveGame();
        this.game.checkAchievements();
        this.game.updateQuestProgress('wheelSpins');
        if (navigator.vibrate) navigator.vibrate(100);
    }
}

// ============================================
// ЗАПУСК + ТЕХРАБОТЫ
// ============================================
document.addEventListener('DOMContentLoaded', () => { window.clickerGame = new ClickerGame(); });

function checkMaintenanceScreen() {
    const userId = localStorage.getItem('userId');
    if (userId === CREATOR_ID) {
        const overlay1 = document.getElementById('techWorkOverlay');
        const overlay2 = document.getElementById('updateOverlay');
        if (overlay1) overlay1.style.display = 'none';
        if (overlay2) overlay2.style.display = 'none';
        return;
    }
    const maintRef = firebase.database().ref('maintenance');
    maintRef.once('value').then(snapshot => {
        const data = snapshot.val();
        const normalOverlay = document.getElementById('techWorkOverlay');
        const updateOverlay = document.getElementById('updateOverlay');
        const timerDiv = document.getElementById('techWorkTimer');
        const updateTimerDiv = document.getElementById('updateTimer');
        const progressBar = document.getElementById('techWorkProgressBar');
        const updateProgressBar = document.getElementById('updateProgressBar');
        if (!normalOverlay || !updateOverlay) return;
        normalOverlay.style.display = 'none';
        updateOverlay.style.display = 'none';
        if (data && data.active === true) {
            if (data.type === 'timer' && data.endTime) {
                updateOverlay.style.display = 'flex';
                const updateTimer = () => {
                    const remaining = data.endTime - Date.now();
                    if (remaining <= 0) { updateOverlay.style.display = 'none'; if (window.timerInterval) clearInterval(window.timerInterval); return; }
                    const seconds = Math.floor(remaining / 1000);
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;
                    if (updateTimerDiv) { updateTimerDiv.textContent = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`; updateTimerDiv.style.display = 'block'; }
                    const total = data.duration || 3600;
                    const progress = ((total - seconds) / total) * 100;
                    if (updateProgressBar) updateProgressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
                };
                updateTimer();
                if (window.timerInterval) clearInterval(window.timerInterval);
                window.timerInterval = setInterval(updateTimer, 1000);
            } else {
                normalOverlay.style.display = 'flex';
                if (data.endTime) {
                    if (timerDiv) timerDiv.style.display = 'block';
                    if (progressBar) progressBar.style.width = '100%';
                    const endTime = data.endTime;
                    const updateNormalTimer = () => {
                        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
                        if (remaining <= 0) { normalOverlay.style.display = 'none'; if (window.timerInterval) clearInterval(window.timerInterval); return; }
                        const hours = Math.floor(remaining / 3600);
                        const minutes = Math.floor((remaining % 3600) / 60);
                        const seconds = remaining % 60;
                        if (timerDiv) timerDiv.textContent = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
                        const total = data.duration || 3600;
                        const progress = ((total - remaining) / total) * 100;
                        if (progressBar) progressBar.style.width = progress + '%';
                    };
                    updateNormalTimer();
                    if (window.timerInterval) clearInterval(window.timerInterval);
                    window.timerInterval = setInterval(updateNormalTimer, 1000);
                } else { if (timerDiv) timerDiv.style.display = 'none'; if (progressBar) progressBar.style.width = '0%'; }
            }
        } else { if (window.timerInterval) clearInterval(window.timerInterval); }
    }).catch(err => console.error('Ошибка проверки техработ:', err));
}

function listenMaintenanceChanges() {
    const maintRef = firebase.database().ref('maintenance');
    maintRef.on('value', () => { checkMaintenanceScreen(); });
}

setTimeout(() => { checkMaintenanceScreen(); listenMaintenanceChanges(); }, 1000);

let activeTechInterval = null;
let activeUpdateInterval = null;

function checkAllScreens() {
    const maintRef = firebase.database().ref('maintenance');
    maintRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        const techWorkOverlay = document.getElementById('techWorkOverlay');
        const updateOverlay = document.getElementById('updateOverlay');
        if (!techWorkOverlay || !updateOverlay) return;
        techWorkOverlay.style.display = 'none';
        updateOverlay.style.display = 'none';
        if (activeTechInterval) clearInterval(activeTechInterval);
        if (activeUpdateInterval) clearInterval(activeUpdateInterval);
        if (!data || data.active !== true) return;
        if (data.type !== 'timer' || !data.endTime) {
            techWorkOverlay.style.display = 'flex';
            const timerDiv = document.getElementById('techWorkTimer');
            const progressBar = document.getElementById('techWorkProgressBar');
            if (timerDiv) timerDiv.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
            return;
        }
        if (data.type === 'timer' && data.endTime) {
            updateOverlay.style.display = 'flex';
            const updateTimerDiv = document.getElementById('updateTimer');
            const updateProgressBar = document.getElementById('updateProgressBar');
            if (!updateTimerDiv || !updateProgressBar) return;
            const updateTimerDisplay = () => {
                const remaining = data.endTime - Date.now();
                if (remaining <= 0) { updateOverlay.style.display = 'none'; if (activeUpdateInterval) clearInterval(activeUpdateInterval); return; }
                const totalSeconds = Math.floor(remaining / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                updateTimerDiv.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                updateTimerDiv.style.display = 'block';
                const totalDuration = data.duration || 3600;
                const progress = ((totalDuration - totalSeconds) / totalDuration) * 100;
                updateProgressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
            };
            updateTimerDisplay();
            activeUpdateInterval = setInterval(updateTimerDisplay, 1000);
        }
    }).catch(err => console.error('Ошибка проверки экранов:', err));
}

function listenScreenChanges() {
    const maintRef = firebase.database().ref('maintenance');
    maintRef.on('value', () => { checkAllScreens(); });
}

function initScreens() { checkAllScreens(); listenScreenChanges(); }

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initScreens);
else initScreens();

(function fixPerformanceMode() {
    const perfCheckbox = document.getElementById('performanceMode');
    if (!perfCheckbox) return;
    function updateNavButtonsDisplay() {
        const isPerformanceMode = document.body.classList.contains('no-liquid-animations');
        const isMobile = window.innerWidth <= 768;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const textSpan = btn.querySelector('.nav-text');
            if (!textSpan) return;
            if (isPerformanceMode && isMobile) textSpan.style.display = 'none';
            else textSpan.style.display = '';
        });
    }
    const observer = new MutationObserver(() => updateNavButtonsDisplay());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', updateNavButtonsDisplay);
    updateNavButtonsDisplay();
})();