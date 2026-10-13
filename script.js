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
        this.globalAnnouncementsInterval = null;
        this.maintenanceTimerInterval = null;
        this.announcementsRef = null;
        
        this.exchangeFrom = null;
        
        this.MONEY_ICON = 'https://avatars.mds.yandex.net/i?id=d2747e92b4fb93d8cee0b3582cb46ea6_l-5332707-images-thumbs&n=13';
        this.DILICKS_ICON = 'https://i.pinimg.com/736x/df/49/fd/df49fd562d564016dcc4070b5e83c521.jpg';
        
        this.skinsData = {
            'classic': { name: 'Классический скин', price: 0, image: 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png', description: 'Стандартный курсор', currency: 'money', multiplier: 1 },
            'neon': { name: 'Неоновый скин', price: 1000, image: 'https://img.freepik.com/premium-photo/neon-style-computer-cursor-arrow-design-vector_1018059-4.jpg?semt=ais_hybrid&w=740', description: 'Яркий неоновый курсор', currency: 'money', multiplier: 1 },
            'monsters_skin': { name: 'Монстр скин', price: 0, image: 'https://static.wikia.nocookie.net/d72429a0-efb9-4e95-bde1-dc811f2bfccf/scale-to-width/755', description: 'Эксклюзивный скин монстра', currency: 'money', multiplier: 1 },
            'dragon_skin': { name: 'Драконий скин', price: 15000, image: 'https://avatars.mds.yandex.net/i?id=78aac0954c4f305798014e687e3d7f1d_l-6327735-images-thumbs&n=13', description: 'Мощный скин дракона', currency: 'dilicks', multiplier: 1 },
            'wheel_dragon_skin': { name: 'Колесный дракон', price: 0, image: 'https://static.wikia.nocookie.net/59310fd4-7c46-4895-930e-6cea7982a142/scale-to-width/755', description: 'Особенный скин дракона (×250 множитель)', currency: 'special', multiplier: 250 },
            'uragan_dragon_top3': { 
                name: 'ДИЛИК КОРОЛЬ', 
                price: 0, 
                image: 'https://th.bing.com/th/id/R.d2bbf70ad9d0dc038f3cb096294cf467?rik=3UM%2fM5%2bcMV2bXA&pid=ImgRaw&r=0', 
                description: 'Легендарный скин Дилик Король! +145 множитель ко всем кликам!', 
                currency: 'special',
                multiplier: 145,
                rarity: 'legendary'
            },
            'uragan_holo_top10': { 
                name: 'ДИЛИК ЛОРД', 
                price: 0, 
                image: 'https://th.bing.com/th/id/R.2c14187fb36da554c6d9ea52169a7ee4?rik=qJswO8RHNxDDZg&pid=ImgRaw&r=0', 
                description: 'Ультра редкий скин Дилик Лорд! +100 множитель ко всем кликам!', 
                currency: 'special',
                multiplier: 100,
                rarity: 'legendary'
            },
            'uragan_banana_top50': { 
                name: 'ДИЛИК МАСТЕР', 
                price: 0, 
                image: 'https://th.bing.com/th/id/R.c35e34219e9055516ff08d1a412844fa?rik=HbGovC7atZlh%2fw&pid=ImgRaw&r=0', 
                description: 'Эксклюзивный скин Дилик Мастер! +55 множитель ко всем кликам!', 
                currency: 'special',
                multiplier: 55,
                rarity: 'epic'
            },
            'uragan_cursor_top100': { 
                name: 'ДИЛИК', 
                price: 0, 
                image: 'https://th.bing.com/th/id/R.5493d8d74a695b06470e70593ca7419c?rik=gB7Dii9D3EP3YQ&pid=ImgRaw&r=0', 
                description: 'Редкий скин Дилик! +15 множитель ко всем кликам!', 
                currency: 'special',
                multiplier: 15,
                rarity: 'rare'
            }
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
        if (banOverlay) {
            banOverlay.style.display = 'none';
        }
        
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
            
            if (!announcements) {
                container.innerHTML = '';
                return;
            }
            
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
                card.innerHTML = `
                    <div class="announcement-text">
                        ${ann.text}
                        <div class="announcement-date">${ann.date || ''}</div>
                    </div>
                    <button class="announcement-close liquid-glass" data-id="${id}">✕</button>
                `;
                
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
                }
                else {
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
                            
                            if (techWorkTimer) {
                                techWorkTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            }
                            
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
            return isMobile && (memory < 4 || cores < 4);
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
                    this.showToast('🎮 Режим экономии включен, анимации отключены', 'success');
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
        
        if (!userId || !currentUser) {
            window.location.href = 'register.html';
            return;
        }
        
        const banCheck = await this.checkBanStatus();
        if (banCheck.isBanned) {
            this.showBanScreen(banCheck.reason, banCheck.endTime, banCheck.isPermanent);
        }
        
        this.showLoader(true);
        
        try {
            const userRef = firebase.database().ref('users/' + userId);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists()) {
                this.userData = snapshot.val();
                if (this.userData.username !== currentUser) {
                    localStorage.clear();
                    window.location.href = 'register.html';
                    return;
                }
                if (!this.userData.eventQuests) this.userData.eventQuests = { lastReset: 0, quests: [] };
                if (this.userData.eventContribution === undefined) this.userData.eventContribution = 0;
                if (!this.userData.wishlist) this.userData.wishlist = null;
                if (!this.userData.rechargeBonus) this.userData.rechargeBonus = 0;
                if (!this.userData.clickerMastery) this.userData.clickerMastery = 0;
                if (!this.userData.eventBooster) this.userData.eventBooster = 0;
                if (this.userData.settings === undefined) {
                    this.userData.settings = { displayName: this.userData.username, theme: 'dark', notifications: true, sound: true, animations: true, language: 'ru', performanceMode: false };
                }
                this.checkAndResetQuests();
            } else {
                localStorage.clear();
                window.location.href = 'register.html';
                return;
            }
        } catch (error) {
            console.error(error);
            localStorage.clear();
            window.location.href = 'register.html';
            return;
        }
        
        this.loadElements();
        this.setupEventListeners();
        this.updateUI();
        this.updateInventory();
        this.updateShopStatus();
        this.renderUpgrades();
        
        if (this.clickIcon && this.userData.currentSkin) {
            this.clickIcon.src = this.skinsData[this.userData.currentSkin].image;
        }
        
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
            
            this.isLoaded = true;
            this.showLoader(false);
        }, 100);
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
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(btn.dataset.tab);
            });
        });
        
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
        
        this.leaderboardBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.leaderboardBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateLeaderboard(btn.dataset.leaderboard);
            });
        });

        this.buyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (btn.disabled || btn.classList.contains('disabled')) {
                    return;
                }
                
                const item = btn.dataset.item;
                const price = parseInt(btn.dataset.price);
                console.log(`🛒 Попытка покупки: ${item} за ${price}`);
                this.buyItem(item, price);
            });
        });

        if (this.moneyCurrencyBtn) {
            this.moneyCurrencyBtn.addEventListener('click', () => this.openExchange('money'));
        }
        if (this.dilicksCurrencyBtn) {
            this.dilicksCurrencyBtn.addEventListener('click', () => this.openExchange('dilicks'));
        }
        if (this.exchangeCloseBtn) {
            this.exchangeCloseBtn.addEventListener('click', () => this.closeExchange());
        }
        if (this.exchangeModal) {
            this.exchangeModal.addEventListener('click', (e) => {
                if (e.target === this.exchangeModal) this.closeExchange();
            });
        }
        if (this.exchangeInput) {
            this.exchangeInput.addEventListener('input', () => this.updateExchangePreview());
        }
        document.querySelectorAll('.exchange-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quick = btn.dataset.quick;
                if (quick === 'max') {
                    if (this.exchangeFrom === 'money') {
                        this.exchangeInput.value = this.userData.money;
                    } else {
                        this.exchangeInput.value = this.userData.dilicks;
                    }
                } else {
                    this.exchangeInput.value = quick;
                }
                this.updateExchangePreview();
            });
        });
        if (this.exchangeConfirmBtn) {
            this.exchangeConfirmBtn.addEventListener('click', () => this.confirmExchange());
        }
    }
    
    switchTab(tabId) {
        this.navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        this.tabs.forEach(tab => tab.classList.toggle('active', tab.id === tabId));
        
        if (tabId === 'inventory') this.updateInventory();
        if (tabId === 'upgrades') this.renderUpgrades();
        if (tabId === 'profile') this.updateProfile();
        if (tabId === 'settings' && this.settings) this.settings.updateUI();
        if (tabId === 'promocodes') { this.updatePromocodesList(); this.updatePromocodesHistory(); }
        if (tabId === 'leaderboard') {
            const activeTab = document.querySelector('.leaderboard-tabs .active');
            this.updateLeaderboard(activeTab ? activeTab.dataset.leaderboard : 'clicks');
        }
        if (tabId === 'events') this.showEventsList();
    }
    
    // ===== ОБМЕННИК ВАЛЮТ (КАРТИНКИ ВМЕСТО ЭМОДЗИ) =====
    openExchange(from) {
        this.exchangeFrom = from;
        
        if (from === 'money') {
            this.exchangeTitle.innerHTML = `
                <img src="${this.MONEY_ICON}" style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle;">
                <span style="color: gold; margin: 0 8px;">→</span>
                <img src="${this.DILICKS_ICON}" style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle;">
            `;
            this.exchangeRate.innerHTML = `
                <span style="color: gold; font-weight: 700;">500</span>
                <img src="${this.MONEY_ICON}" style="width: 22px; height: 22px; border-radius: 50%; vertical-align: middle; margin: 0 4px;">
                <span style="color: gold; font-weight: 700;">=</span>
                <span style="color: gold; font-weight: 700;">1</span>
                <img src="${this.DILICKS_ICON}" style="width: 22px; height: 22px; border-radius: 50%; vertical-align: middle; margin: 0 4px;">
            `;
            this.exchangeInputLabel.textContent = 'Сколько золота отдаёшь:';
            this.exchangeDirection.innerHTML = `
                <img src="${this.MONEY_ICON}" class="exchange-currency-icon">
                <span class="exchange-arrow">→</span>
                <img src="${this.DILICKS_ICON}" class="exchange-currency-icon">
            `;
            this.exchangeInput.placeholder = 'Золото';
            this.exchangeBalanceFrom.innerHTML = `${this.userData.money.toLocaleString()} <img src="${this.MONEY_ICON}" style="width: 18px; height: 18px; border-radius: 50%; vertical-align: middle; margin-left: 4px;">`;
            this.exchangeInput.value = '';
            this.updateExchangePreview();
        } else {
            this.exchangeTitle.innerHTML = `
                <img src="${this.DILICKS_ICON}" style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle;">
                <span style="color: gold; margin: 0 8px;">→</span>
                <img src="${this.MONEY_ICON}" style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle;">
            `;
            this.exchangeRate.innerHTML = `
                <span style="color: gold; font-weight: 700;">1</span>
                <img src="${this.DILICKS_ICON}" style="width: 22px; height: 22px; border-radius: 50%; vertical-align: middle; margin: 0 4px;">
                <span style="color: gold; font-weight: 700;">=</span>
                <span style="color: gold; font-weight: 700;">500</span>
                <img src="${this.MONEY_ICON}" style="width: 22px; height: 22px; border-radius: 50%; vertical-align: middle; margin: 0 4px;">
            `;
            this.exchangeInputLabel.textContent = 'Сколько диликов отдаёшь:';
            this.exchangeDirection.innerHTML = `
                <img src="${this.DILICKS_ICON}" class="exchange-currency-icon">
                <span class="exchange-arrow">→</span>
                <img src="${this.MONEY_ICON}" class="exchange-currency-icon">
            `;
            this.exchangeInput.placeholder = 'Дилики';
            this.exchangeBalanceFrom.innerHTML = `${this.userData.dilicks.toLocaleString()} <img src="${this.DILICKS_ICON}" style="width: 18px; height: 18px; border-radius: 50%; vertical-align: middle; margin-left: 4px;">`;
            this.exchangeInput.value = '';
            this.updateExchangePreview();
        }
        
        this.exchangeModal.classList.add('active');
    }
    
    closeExchange() {
        this.exchangeModal.classList.remove('active');
        this.exchangeInput.value = '';
        this.exchangeResultValue.innerHTML = '0';
    }
    
    updateExchangePreview() {
        const amount = parseFloat(this.exchangeInput.value) || 0;
        let result = 0;
        let resultIcon = '';
        
        if (this.exchangeFrom === 'money') {
            result = amount / 500;
            resultIcon = `<img src="${this.DILICKS_ICON}" class="exchange-result-icon">`;
        } else {
            result = amount * 500;
            resultIcon = `<img src="${this.MONEY_ICON}" class="exchange-result-icon">`;
        }
        
        let formattedResult;
        if (this.exchangeFrom === 'money') {
            if (result === Math.floor(result)) {
                formattedResult = result.toLocaleString();
            } else {
                formattedResult = result.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
            }
        } else {
            formattedResult = Math.floor(result).toLocaleString();
        }
        
        this.exchangeResultValue.innerHTML = `${formattedResult} ${resultIcon}`;
        
        if (this.exchangeFrom === 'money') {
            if (amount > this.userData.money) {
                this.exchangeConfirmBtn.disabled = true;
                this.exchangeConfirmBtn.textContent = '❌ НЕДОСТАТОЧНО ЗОЛОТА';
            } else if (amount <= 0) {
                this.exchangeConfirmBtn.disabled = true;
                this.exchangeConfirmBtn.textContent = 'ВВЕДИ СУММУ';
            } else {
                this.exchangeConfirmBtn.disabled = false;
                this.exchangeConfirmBtn.textContent = 'ОБМЕНЯТЬ';
            }
        } else {
            if (amount > this.userData.dilicks) {
                this.exchangeConfirmBtn.disabled = true;
                this.exchangeConfirmBtn.textContent = '❌ НЕДОСТАТОЧНО ДИЛИКОВ';
            } else if (amount <= 0) {
                this.exchangeConfirmBtn.disabled = true;
                this.exchangeConfirmBtn.textContent = 'ВВЕДИ СУММУ';
            } else {
                this.exchangeConfirmBtn.disabled = false;
                this.exchangeConfirmBtn.textContent = 'ОБМЕНЯТЬ';
            }
        }
    }
    
    async confirmExchange() {
        const amount = parseFloat(this.exchangeInput.value) || 0;
        
        if (amount <= 0) {
            this.showToast('❌ Введи корректную сумму', 'error');
            return;
        }
        
        if (this.exchangeFrom === 'money') {
            if (amount > this.userData.money) {
                this.showToast('❌ Недостаточно золота!', 'error');
                return;
            }
            
            const dilicksToGive = amount / 500;
            this.userData.money -= amount;
            this.userData.dilicks += dilicksToGive;
            
            this.showToast(`✅ Обменяно ${amount.toLocaleString()} 🪙 на ${dilicksToGive.toLocaleString()} ${this.getDilicksIcon()}`, 'success');
        } else {
            if (amount > this.userData.dilicks) {
                this.showToast('❌ Недостаточно диликов!', 'error');
                return;
            }
            
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
                this.exchangeBalanceFrom.innerHTML = `${this.userData.money.toLocaleString()} <img src="${this.MONEY_ICON}" style="width: 18px; height: 18px; border-radius: 50%; vertical-align: middle; margin-left: 4px;">`;
            } else {
                this.exchangeBalanceFrom.innerHTML = `${this.userData.dilicks.toLocaleString()} <img src="${this.DILICKS_ICON}" style="width: 18px; height: 18px; border-radius: 50%; vertical-align: middle; margin-left: 4px;">`;
            }
            this.exchangeInput.value = '';
            this.updateExchangePreview();
        }
    }    showEventsList() {
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
            this.userData.eventQuests = {
                lastReset: now,
                quests: this.generateDailyQuests()
            };
            this.saveGame();
            this.showToast('🔄 Задания ивента обновлены!', 'success');
            if (document.getElementById('uraganContent').style.display === 'block') {
                this.renderUraganQuests();
            }
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
            const allCompleted = this.userData.eventQuests.quests.filter(q => q.id !== 'all' && q.completed).length === 5;
            if (allCompleted) {
                allQuest.completed = true;
                this.userData.dilicks += allQuest.reward;
                changed = true;
                this.showToast(`✅ Задание "Выполнить все задания" выполнено! +${allQuest.reward.toLocaleString()} ${this.getDilicksIcon()}`, 'success');
            }
        }
        if (changed) { this.saveGame(); this.renderUraganQuests(); }
    }
    
    getDilicksIcon() {
        return `<img src="${this.DILICKS_ICON}" style="width: 16px; height: 16px; border-radius: 50%; vertical-align: middle;">`;
    }
    
    getMoneyIcon() {
        return `<img src="${this.MONEY_ICON}" style="width: 16px; height: 16px; border-radius: 50%; vertical-align: middle;">`;
    }
    
    async loadWishlist() {
        const wishlistGrid = document.getElementById('wishlistGrid');
        if (!wishlistGrid) return;
        
        const savedWishlist = this.userData.wishlist || null;
        
        const wishlistItems = wishlistGrid.querySelectorAll('.wishlist-item');
        wishlistItems.forEach(item => {
            const wishValue = item.dataset.wish;
            if (savedWishlist === wishValue) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
            
            item.removeEventListener('click', this.wishlistClickHandler);
            this.wishlistClickHandler = async () => {
                wishlistItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.userData.wishlist = wishValue;
                await this.saveGame();
                this.showToast(`🎁 Вишлист обновлен: ${item.querySelector('.reward-name').textContent}`, 'success');
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
            if (document.getElementById('uraganContent').style.display === 'block') {
                this.updateUraganTop();
                this.renderUraganQuests();
            }
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
                    if (remaining <= 0) {
                        if (eventTimer) eventTimer.textContent = 'Ивент завершён';
                    } else {
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
                const goalPool = 100000000;
                const progress = (totalPool / goalPool) * 100;
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
            questItem.innerHTML = `
                <div class="quest-info">
                    <div class="quest-name">${quest.name}</div>
                    <div class="quest-progress">${quest.progress.toLocaleString()} / ${quest.target.toLocaleString()}</div>
                    <div class="progress-bar" style="height: 4px; margin-top: 5px;">
                        <div class="progress-fill" style="width: ${progressPercent}%; height: 4px;"></div>
                    </div>
                </div>
                <div class="quest-reward">+${quest.reward.toLocaleString()} ${this.getDilicksIcon()}</div>
                <div class="quest-status ${isCompleted ? 'completed' : 'active'}">
                    ${isCompleted ? '✅ ВЫПОЛНЕНО' : '🏃 В ПРОЦЕССЕ'}
                </div>
            `;
            questsList.appendChild(questItem);
        });
    }
    
    async updateUraganTop() {
        const topList = document.getElementById('topList');
        if (!topList) return;
        topList.innerHTML = '<div class="top-item">Загрузка...</div>';
        try {
            const snapshot = await firebase.database().ref('users').once('value');
            const users = snapshot.val();
            const topPlayers = [];
            for (const [id, user] of Object.entries(users)) {
                const contribution = user.eventContribution || 0;
                if (contribution > 0) {
                    const displayName = user.settings?.displayName || user.username;
                    topPlayers.push({ name: displayName, contribution, id });
                }
            }
            topPlayers.sort((a, b) => b.contribution - a.contribution);
            const top10 = topPlayers.slice(0, 10);
            topList.innerHTML = '';
            top10.forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'top-item';
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                item.innerHTML = `<div class="top-rank">${medal || (index + 1)}</div><div class="top-name">${player.name} ${player.id === localStorage.getItem('userId') ? '👑' : ''}</div><div class="top-value">${player.contribution.toLocaleString()} ${this.getDilicksIcon()}</div>`;
                topList.appendChild(item);
            });
            if (top10.length === 0) topList.innerHTML = '<div class="top-item">Пока нет участников</div>';
        } catch (error) {
            console.error(error);
            topList.innerHTML = '<div class="top-item">Ошибка загрузки</div>';
        }
    }
    
    async addEventContribution(amount) {
        if (!this.uraganEventActive) return;
        if (amount <= 0) return;
        
        const booster = (this.userData.eventBooster || 0) * 0.05;
        const boostedAmount = Math.floor(amount * (1 + booster));
        
        this.userData.eventContribution = (this.userData.eventContribution || 0) + boostedAmount;
        const eventsRef = firebase.database().ref('events/dilicksHurricane');
        const snapshot = await eventsRef.once('value');
        const currentPool = snapshot.val()?.totalPool || 0;
        await eventsRef.update({ totalPool: currentPool + boostedAmount });
        await this.saveGame();
        const userContributionSpan = document.getElementById('userContribution');
        if (userContributionSpan) userContributionSpan.textContent = this.userData.eventContribution.toLocaleString();
    }
    
    handleClick(e) {
        if (!this.isLoaded && this.userData) this.isLoaded = true;
        
        let clickPower = this.userData.clickPower;
        
        const skinMultipliers = {
            'uragan_dragon_top3': 145,
            'uragan_holo_top10': 100,
            'uragan_banana_top50': 55,
            'uragan_cursor_top100': 15,
            'wheel_dragon_skin': 250
        };
        const skinMultiplier = skinMultipliers[this.userData.currentSkin] || 1;
        clickPower = clickPower * skinMultiplier;
        
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
    
    createClickEffect(x, y, text) {
        if (!this.clickEffects) return;
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.textContent = text;
        const rect = this.clickEffects.getBoundingClientRect();
        effect.style.left = (x - rect.left) + 'px';
        effect.style.top = (y - rect.top) + 'px';
        this.clickEffects.appendChild(effect);
        setTimeout(() => { if (effect.parentNode) effect.remove(); }, 600);
    }
    
    async buyItem(item, price) {
        console.log(`🛒 buyItem вызван: item=${item}, price=${price}`);
        
        if (item === 'wheel_dragon_skin') { 
            this.showToast('❌ Этот скин можно получить только в колесе фортуны!', 'error');
            return; 
        }
        
        if (item.startsWith('uragan_')) {
            this.showToast('❌ Этот скин можно получить только в ивенте "Диликовый ураган"!', 'error');
            return;
        }
        
        if (this.userData.inventory && this.userData.inventory.includes(item)) {
            this.showToast('⚠️ Этот скин уже куплен!', 'warning');
            return;
        }
        
        if (item === 'dragon_skin') {
            if (this.userData.dilicks >= price) {
                this.userData.dilicks -= price;
            } else { 
                this.showToast(`❌ Недостаточно диликов! Есть: ${this.userData.dilicks.toLocaleString()}, нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                return; 
            }
        } else {
            if (this.userData.money >= price) {
                this.userData.money -= price;
            } else { 
                this.showToast(`❌ Недостаточно денег! Есть: ${this.userData.money.toLocaleString()}, нужно: ${price.toLocaleString()} ${this.getMoneyIcon()}`, 'error');
                return; 
            }
        }
        
        if (!this.userData.inventory) this.userData.inventory = [];
        if (!this.userData.inventory.includes(item)) this.userData.inventory.push(item);
        this.userData.currentSkin = item;
        if (this.clickIcon) this.clickIcon.src = this.skinsData[item].image;
        
        this.updateUI();
        await this.saveGame();
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
            { id: 'critChance', name: 'Критический удар', description: 'Шанс нанести крит урон', basePrice: 200, priceMultiplier: 50, getLevel: () => this.userData.critChance, maxLevel: 100, effect: () => `${this.userData.critChance}% шанс крита`, step: 5 },
            { id: 'rechargeBonus', name: 'Бонус перезарядки', description: '+10% к силе клика каждые 10 уровней', basePrice: 500, priceMultiplier: 200, getLevel: () => this.userData.rechargeBonus || 0, maxLevel: 50, effect: () => `x${1 + (this.userData.rechargeBonus || 0) * 0.1} к силе` },
            { id: 'clickerMastery', name: 'Мастерство кликера', description: 'Увеличивает множитель крита', basePrice: 1000, priceMultiplier: 300, getLevel: () => this.userData.clickerMastery || 0, maxLevel: 30, effect: () => `x${2 + (this.userData.clickerMastery || 0) * 0.1} крит множитель` },
            { id: 'eventBooster', name: 'Усилитель ивентов', description: '+5% к диликам в ивентах', basePrice: 1500, priceMultiplier: 400, getLevel: () => this.userData.eventBooster || 0, maxLevel: 20, effect: () => `+${(this.userData.eventBooster || 0) * 5}% диликов в ивентах` }
        ];
        
        this.upgradesGrid.innerHTML = '';
        
        for (const upgrade of upgrades) {
            const currentLevel = upgrade.getLevel();
            const price = upgrade.basePrice + (currentLevel * upgrade.priceMultiplier);
            const isMaxLevel = currentLevel >= upgrade.maxLevel;
            
            const card = document.createElement('div');
            card.className = 'glass-card upgrade-item liquid-glass';
            card.dataset.upgrade = upgrade.id;
            card.innerHTML = `
                <h3>${upgrade.name}</h3>
                <p class="upgrade-description">${upgrade.description}</p>
                <p>Уровень: <span class="upgrade-level">${currentLevel}</span> / ${upgrade.maxLevel}</p>
                <p>Эффект: <span class="upgrade-effect">${upgrade.effect()}</span></p>
                <p class="upgrade-price">${this.getDilicksIcon()} <span class="price-value">${price.toLocaleString()}</span></p>
                ${!isMaxLevel ? '<button class="glass-btn upgrade-btn liquid-glass">Улучшить</button>' : '<button class="glass-btn upgrade-btn liquid-glass disabled" disabled>МАКСИМУМ</button>'}
            `;
            
            if (!isMaxLevel) {
                const btn = card.querySelector('.upgrade-btn');
                btn.addEventListener('click', () => this.buyUpgrade(upgrade.id, price));
            }
            
            this.upgradesGrid.appendChild(card);
        }
    }
    
    async buyUpgrade(upgradeType, price) {
        switch(upgradeType) {
            case 'clickPower':
                if (this.userData.dilicks >= price) {
                    this.userData.dilicks -= price;
                    this.userData.clickPower++;
                    this.showToast(`✅ Усилитель клика улучшен до ${this.userData.clickPower} уровня!`, 'success');
                } else {
                    this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                    return;
                }
                break;
            case 'autoClicker':
                if (this.userData.dilicks >= price) {
                    this.userData.dilicks -= price;
                    this.userData.autoClickerLevel++;
                    this.restartAutoClicker();
                    this.showToast(`✅ Автокликер улучшен до ${this.userData.autoClickerLevel} уровня!`, 'success');
                } else {
                    this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                    return;
                }
                break;
            case 'critChance':
                if (this.userData.dilicks >= price) {
                    this.userData.dilicks -= price;
                    this.userData.critChance += 5;
                    this.showToast(`✅ Шанс крита увеличен до ${this.userData.critChance}%!`, 'success');
                } else {
                    this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                    return;
                }
                break;
            case 'rechargeBonus':
                if (this.userData.dilicks >= price) {
                    this.userData.dilicks -= price;
                    this.userData.rechargeBonus = (this.userData.rechargeBonus || 0) + 1;
                    this.showToast(`✅ Бонус перезарядки улучшен до ${this.userData.rechargeBonus} уровня!`, 'success');
                } else {
                    this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                    return;
                }
                break;
            case 'clickerMastery':
                if (this.userData.dilicks >= price) {
                    this.userData.dilicks -= price;
                    this.userData.clickerMastery = (this.userData.clickerMastery || 0) + 1;
                    this.showToast(`✅ Мастерство кликера улучшено до ${this.userData.clickerMastery} уровня!`, 'success');
                } else {
                    this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                    return;
                }
                break;
            case 'eventBooster':
                if (this.userData.dilicks >= price) {
                    this.userData.dilicks -= price;
                    this.userData.eventBooster = (this.userData.eventBooster || 0) + 1;
                    this.showToast(`✅ Усилитель ивентов улучшен до ${this.userData.eventBooster} уровня!`, 'success');
                } else {
                    this.showToast(`❌ Недостаточно диликов! Нужно: ${price.toLocaleString()} ${this.getDilicksIcon()}`, 'error');
                    return;
                }
                break;
            default:
                return;
        }
        
        this.renderUpgrades();
        this.updateUI();
        await this.saveGame();
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
            
            skinCard.innerHTML = `
                <div class="skin-preview"><img src="${skin.image}" alt="${skin.name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/4366/4366891.png'"></div>
                <h3>${skin.name}</h3>
                <p class="skin-description">${skin.description}</p>
                ${skin.multiplier > 1 ? `<p class="skin-multiplier">✨ x${skin.multiplier} множитель!</p>` : ''}
                ${isCurrentSkin ? '<p class="skin-equipped">✅ ЭКИПИРОВАНО</p>' : '<button class="glass-btn equip-btn liquid-glass">ЭКИПИРОВАТЬ</button>'}
            `;
            const equipBtn = skinCard.querySelector('.equip-btn');
            if (equipBtn) equipBtn.addEventListener('click', (e) => { e.stopPropagation(); this.equipSkin(skinId); });
            this.inventoryGrid.appendChild(skinCard);
        });
    }
    
    async equipSkin(skinId) {
        this.userData.currentSkin = skinId;
        if (this.clickIcon) this.clickIcon.src = this.skinsData[skinId].image;
        
        const multiplier = this.getSkinMultiplier(skinId);
        if (multiplier > 1 && this.clickPowerSpan && this.userData) {
            let basePower = this.userData.clickPower;
            let totalPower = basePower * multiplier;
            this.clickPowerSpan.textContent = totalPower;
        }
        
        await this.saveGame();
        this.updateInventory();
        this.createClickEffect(window.innerWidth / 2, window.innerHeight / 2, `✨ ${this.skinsData[skinId].name} ✨`);
        if (this.clickIcon) {
            this.clickIcon.style.transform = 'scale(0.8)';
            setTimeout(() => { if (this.clickIcon) this.clickIcon.style.transform = 'scale(1)'; }, 200);
        }
        this.showToast(`✨ Экипирован скин: ${this.skinsData[skinId].name}${multiplier > 1 ? ` (x${multiplier} множитель!)` : ''}`, 'success');
    }
    
    startAutoClicker() {
        if (this.autoClickerInterval) clearInterval(this.autoClickerInterval);
        this.autoClickerInterval = setInterval(() => {
            if (this.userData.autoClickerLevel > 0 && this.isLoaded) {
                for (let i = 0; i < this.userData.autoClickerLevel; i++) {
                    let clickPower = this.userData.clickPower;
                    
                    const skinMultipliers = {
                        'uragan_dragon_top3': 145,
                        'uragan_holo_top10': 100,
                        'uragan_banana_top50': 55,
                        'uragan_cursor_top100': 15,
                        'wheel_dragon_skin': 250
                    };
                    const skinMultiplier = skinMultipliers[this.userData.currentSkin] || 1;
                    clickPower = clickPower * skinMultiplier;
                    
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
                    }
                    
                    this.userData.clicks++;
                    this.userData.money += moneyEarned;
                    this.userData.dilicks += dilicksEarned;
                    if (this.uraganEventActive) this.addEventContribution(dilicksEarned);
                    this.addSeasonExp(moneyEarned);
                }
                this.updateUI();
                this.saveGame();
                this.checkAchievements();
                this.updateQuestProgress('clicks', this.userData.autoClickerLevel);
                this.updateQuestProgress('dilicksEarned', this.userData.autoClickerLevel * (this.uraganEventActive ? this.currentUraganMultiplier : 1));
                this.updateQuestProgress('moneyEarned', this.userData.autoClickerLevel * this.userData.clickPower);
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
    
    addSeasonExp(amount) {
        this.userData.seasonExp += amount;
        let expNeeded = 100 + (this.userData.seasonLevel * 50);
        while (this.userData.seasonExp >= expNeeded && this.userData.seasonLevel < 50) {
            this.userData.seasonExp -= expNeeded;
            this.userData.seasonLevel++;
            this.userData.money += 100;
            this.userData.dilicks += 10;
            expNeeded = 100 + (this.userData.seasonLevel * 50);
        }
        if (this.seasonProgress && this.seasonLevel) {
            const progress = (this.userData.seasonExp / expNeeded) * 100;
            this.seasonProgress.style.width = progress + '%';
            this.seasonLevel.textContent = this.userData.seasonLevel;
        }
    }
    
    async buyPremiumPass() {
        if (this.userData.dilicks >= 500) {
            this.userData.dilicks -= 500;
            this.userData.premiumPass = true;
            this.updateUI();
            await this.saveGame();
            this.showToast('✅ Премиум пропуск активирован!', 'success');
        } else {
            this.showToast(`❌ Недостаточно диликов! Нужно: 500 ${this.getDilicksIcon()}`, 'error');
        }
    }
    
    async showPlayerProfile(playerId, playerName) {
        const modal = document.getElementById('playerProfileModal');
        if (!modal) return;
        
        try {
            const snapshot = await firebase.database().ref('users/' + playerId).once('value');
            const userData = snapshot.val();
            
            if (!userData) {
                this.showToast('❌ Игрок не найден', 'error');
                return;
            }
            
            const username = userData.settings?.displayName || userData.username;
            const modalUsername = document.getElementById('modalUsername');
            
            modalUsername.innerHTML = username;
            modalUsername.style.background = 'linear-gradient(135deg, #fff, #ffd700)';
            modalUsername.style.webkitBackgroundClip = 'text';
            modalUsername.style.webkitTextFillColor = 'transparent';
            modalUsername.style.backgroundClip = 'text';
            modalUsername.style.fontSize = '28px';
            modalUsername.style.fontWeight = '700';
            modalUsername.style.marginBottom = '10px';
            modalUsername.style.textShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
            
            document.getElementById('modalClicks').textContent = (userData.clicks || 0).toLocaleString();
            document.getElementById('modalMoney').textContent = (userData.money || 0).toLocaleString();
            document.getElementById('modalDilicks').textContent = (userData.dilicks || 0).toLocaleString();
            document.getElementById('modalLevel').textContent = userData.seasonLevel || 1;
            
            const avatarImg = document.getElementById('modalAvatar');
            if (userData.currentSkin && this.skinsData[userData.currentSkin]) {
                avatarImg.src = this.skinsData[userData.currentSkin].image;
            } else {
                avatarImg.src = 'https://cdn-icons-png.flaticon.com/512/4366/4366891.png';
            }
            
            modal.classList.add('active');
            
            const closeBtn = document.getElementById('closeProfileModal');
            if (closeBtn) {
                closeBtn.onclick = () => modal.classList.remove('active');
            }
            
            modal.onclick = (e) => {
                if (e.target === modal) modal.classList.remove('active');
            };
        } catch (error) {
            console.error(error);
            this.showToast('❌ Ошибка загрузки профиля', 'error');
        }
    }
    
    async updateLeaderboard(type) {
        if (!this.leaderboardBody) return;
        this.leaderboardBody.innerHTML = '<tr><td colspan="3" class="empty-history">Загрузка...<\/td><\/tr>';
        try {
            const snapshot = await firebase.database().ref('users').once('value');
            if (!snapshot.exists()) { 
                this.leaderboardBody.innerHTML = '<tr><td colspan="3" class="empty-history">Нет данных<\/td><\/tr>'; 
                return; 
            }
            const users = snapshot.val();
            const leaderboard = [];
            for (let [id, userData] of Object.entries(users)) {
                let value = 0;
                switch(type) {
                    case 'clicks': value = userData.clicks || 0; break;
                    case 'money': value = userData.money || 0; break;
                    case 'playtime': value = userData.playtime || 0; break;
                }
                const displayName = userData.settings?.displayName || userData.username;
                leaderboard.push({ id: id, username: displayName, value, realUsername: userData.username });
            }
            leaderboard.sort((a, b) => b.value - a.value);
            const topPlayers = leaderboard.slice(0, 50);
            this.leaderboardBody.innerHTML = '';
            topPlayers.forEach((entry, index) => {
                const row = document.createElement('tr');
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                row.innerHTML = `
                    <td style="width: 60px;">${medal ? medal : index + 1}<\/td>
                    <td class="leaderboard-player" data-id="${entry.id}" style="cursor: pointer; transition: all 0.2s ease;">${entry.username} ${entry.realUsername === localStorage.getItem('currentUser') ? '👑' : ''}<\/td>
                    <td>${this.formatLeaderboardValue(entry.value, type)}<\/td>
                `;
                
                const playerCell = row.querySelector('.leaderboard-player');
                if (playerCell) {
                    playerCell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showPlayerProfile(entry.id, entry.username);
                    });
                    playerCell.addEventListener('mouseenter', () => {
                        playerCell.style.textDecoration = 'underline';
                        playerCell.style.color = 'gold';
                    });
                    playerCell.addEventListener('mouseleave', () => {
                        playerCell.style.textDecoration = 'none';
                        playerCell.style.color = 'white';
                    });
                }
                
                if (entry.realUsername === localStorage.getItem('currentUser')) { 
                    row.style.background = 'rgba(255,215,0,0.1)'; 
                    row.style.border = '1px solid gold'; 
                }
                this.leaderboardBody.appendChild(row);
            });
        } catch (error) { 
            console.error(error); 
            this.leaderboardBody.innerHTML = '<td><td colspan="3" class="empty-history">Ошибка загрузки<\/td><\/tr>'; 
        }
    }
    
    formatLeaderboardValue(value, type) {
        if (type === 'playtime') {
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            return `${hours}ч ${minutes}м`;
        }
        return value.toLocaleString();
    }
    
    async updateUI() {
        const displayName = this.userData.settings?.displayName || this.userData.username;
        if (this.usernameDisplay) this.usernameDisplay.textContent = displayName;
        if (this.moneySpan) this.moneySpan.textContent = this.userData.money.toLocaleString();
        if (this.dilicksSpan) this.dilicksSpan.textContent = this.userData.dilicks.toLocaleString();
        if (this.clicksSpan) this.clicksSpan.textContent = this.userData.clicks.toLocaleString();
        
        if (this.clickPowerSpan && this.userData) {
            const skinMultiplier = this.getSkinMultiplier(this.userData.currentSkin);
            const totalPower = this.userData.clickPower * skinMultiplier;
            this.clickPowerSpan.textContent = totalPower;
        }
        
        this.updatePlaytimeDisplay();
        if (this.seasonProgress && this.seasonLevel) {
            const expNeeded = 100 + (this.userData.seasonLevel * 50);
            const progress = (this.userData.seasonExp / expNeeded) * 100;
            this.seasonProgress.style.width = progress + '%';
            this.seasonLevel.textContent = this.userData.seasonLevel;
        }
        if (document.getElementById('profile')?.classList.contains('active')) this.updateProfile();
        if (this.wheel && this.wheel.balanceSpan) this.wheel.balanceSpan.textContent = this.userData.dilicks.toLocaleString();
    }
    
    async saveGame() {
        const userId = localStorage.getItem('userId');
        if (userId && this.isLoaded) {
            try { await firebase.database().ref('users/' + userId).update(this.userData); }
            catch (error) { console.error('❌ Ошибка сохранения:', error); }
        }
    }
    
    async logout() {
        if (this.bubbleFrame) cancelAnimationFrame(this.bubbleFrame);
        if (this.autoClickerInterval) clearInterval(this.autoClickerInterval);
        if (this.playtimeInterval) clearInterval(this.playtimeInterval);
        if (this.questTimerInterval) clearInterval(this.questTimerInterval);
        if (this.banTimerInterval) clearInterval(this.banTimerInterval);
        if (this.maintenanceTimerInterval) clearInterval(this.maintenanceTimerInterval);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        window.location.href = 'register.html';
    }
    
    createBubble() {
        const existingBubbles = document.querySelectorAll('.bubble').length;
        if (existingBubbles > 10) return;
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
        setTimeout(() => { if (bubble.parentNode) bubble.remove(); }, duration * 1000);
    }
    
    startBubbles() {
        const bubbleInterval = 2500;
        const createBubbleOptimized = (currentTime) => {
            if (currentTime - this.lastBubbleTime >= bubbleInterval && this.isLoaded) {
                this.createBubble();
                this.lastBubbleTime = currentTime;
            }
            this.bubbleFrame = requestAnimationFrame(createBubbleOptimized);
        };
        this.bubbleFrame = requestAnimationFrame(createBubbleOptimized);
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
            card.innerHTML = `
                <div class="achievement-icon ${!isCompleted ? 'locked' : ''}"><img src="${achievement.icon}" alt="${achievement.name}"></div>
                <h3 class="achievement-title">${achievement.name}</h3>
                <p class="achievement-desc">${achievement.description}</p>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar"><div class="achievement-progress-fill" style="width: ${progress}%"></div></div>
                    <div class="achievement-progress-text">${isCompleted ? 'Выполнено' : `${Math.round(progress)}%`}</div>
                </div>
            `;
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
        notification.innerHTML = `
            <div class="notification-icon"><img src="${achievement.icon}" alt="${achievement.name}"></div>
            <div class="notification-content">
                <h4>Достижение получено!</h4>
                <p>${achievement.name}</p>
                <p class="notification-reward">${rewardText}</p>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => { notification.classList.remove('show'); setTimeout(() => notification.remove(), 300); }, 3000);
    }
    
    updateSkinStats() {
        if (!this.ownedSkinsList) return;
        const totalSkins = Object.keys(this.skinsData).length;
        const ownedSkins = this.userData.inventory?.length || 0;
        if (this.skinProgressFill) { this.skinProgressFill.style.width = (ownedSkins / totalSkins) * 100 + '%'; }
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
        if (promocode.expiryDate && Date.now() > promocode.expiryDate) { this.showPromocodeMessage('Срок действия промокода истек', 'error'); return; }
        if (this.userData.activatedPromocodes && this.userData.activatedPromocodes.includes(code)) { this.showPromocodeMessage('Вы уже активировали этот промокод', 'error'); return; }
        
        let rewardMessage = '';
        if (promocode.reward.money > 0) { this.userData.money += promocode.reward.money; rewardMessage += `+${promocode.reward.money.toLocaleString()} ${this.getMoneyIcon()} `; }
        if (promocode.reward.dilicks > 0) { this.userData.dilicks += promocode.reward.dilicks; rewardMessage += `+${promocode.reward.dilicks.toLocaleString()} ${this.getDilicksIcon()} `; }
        if (promocode.reward.skin) {
            const skinId = promocode.reward.skin;
            if (this.skinsData[skinId] && !this.userData.inventory.includes(skinId)) {
                this.userData.inventory.push(skinId);
                rewardMessage += `+скин "${this.skinsData[skinId].name}" ✨`;
                if (!this.userData.currentSkin) { this.userData.currentSkin = skinId; if (this.clickIcon) this.clickIcon.src = this.skinsData[skinId].image; }
            } else { this.userData.dilicks += 100; rewardMessage += `+100 ${this.getDilicksIcon()} (скин уже был)`; }
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
            item.setAttribute('data-code', promocode.code);
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
        if (history.length === 0) { const empty = document.createElement('div'); empty.className = 'empty-history'; empty.textContent = 'История активаций пуста'; this.promocodesHistory.appendChild(empty); return; }
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
        modal.innerHTML = `<div class="modal-content" style="max-width:450px;background:rgba(20,25,35,0.95);border:2px solid gold;border-radius:50px;padding:30px;text-align:center;"><h2 style="color:gold;font-size:2rem;margin-bottom:20px;">🎁 БОНУС ОБНОВЛЕНИЯ</h2><div style="margin:20px 0;"><img src="${this.DILICKS_ICON}" style="width:60px;height:60px;border-radius:50%;margin-bottom:15px;"><p style="color:white;font-size:1.2rem;margin-bottom:10px;">В игру добавлены новые скины!</p><p style="color:rgba(255,255,255,0.8);margin-bottom:20px;">Для коллекционеров мы подготовили компенсацию:</p><div style="background:rgba(255,215,0,0.1);border-radius:30px;padding:15px;margin-bottom:20px;"><span style="color:gold;font-size:2rem;font-weight:bold;">+4500</span><img src="${this.DILICKS_ICON}" style="width:30px;height:30px;border-radius:50%;margin-left:10px;"></div></div><div style="display:flex;gap:15px;justify-content:center;"><button class="modal-btn confirm" id="claimCompensation" style="background:rgba(76,175,80,0.2);border:1px solid #4CAF50;color:white;padding:12px 30px;border-radius:40px;font-weight:bold;cursor:pointer;">ПОЛУЧИТЬ</button><button class="modal-btn cancel" id="closeCompensation" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:12px 30px;border-radius:40px;font-weight:bold;cursor:pointer;">ПОЗЖЕ</button></div></div>`;
        document.body.appendChild(modal);
        document.getElementById('claimCompensation').addEventListener('click', () => { this.claimCompensation(); modal.remove(); });
        document.getElementById('closeCompensation').addEventListener('click', () => { modal.remove(); });
    }
    
    async claimCompensation() {
        this.userData.dilicks += 4500;
        this.userData.compensationReceived = true;
        await this.saveGame();
        this.updateUI();
        this.showToast(`✅ +4500 ${this.getDilicksIcon()} получено!`, 'success');
    }
    
    checkIfCreator() {
        const userId = localStorage.getItem('userId');
        const adminBtn = document.getElementById('adminLinkBtn');
        if (userId === this.CREATOR_ID && adminBtn) { adminBtn.style.display = 'inline-block'; console.log('👑 Админ-кнопка активирована'); }
    }
}

// ============================================
// КЛАСС НАСТРОЕК
// ============================================

class Settings {
    constructor(game) {
        this.game = game;
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
    }
    
    loadSettings() {
        if (!this.game.userData.settings) {
            this.game.userData.settings = { displayName: this.game.userData.username, theme: 'dark', notifications: true, sound: true, animations: true, language: 'ru', performanceMode: false };
        }
    }
    
    setupEventListeners() {
        const saveDisplayName = document.getElementById('saveDisplayName');
        if (saveDisplayName) saveDisplayName.addEventListener('click', () => this.saveDisplayName());
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => this.changePassword());
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.addEventListener('change', (e) => this.saveTheme(e.target.value));
        const notificationsEnabled = document.getElementById('notificationsEnabled');
        if (notificationsEnabled) notificationsEnabled.addEventListener('change', (e) => { this.game.userData.settings.notifications = e.target.checked; this.game.saveGame(); this.game.showToast('✅ Настройки уведомлений сохранены', 'success'); });
        const soundEnabled = document.getElementById('soundEnabled');
        if (soundEnabled) soundEnabled.addEventListener('change', (e) => { this.game.userData.settings.sound = e.target.checked; this.game.saveGame(); this.game.showToast('✅ Настройки звука сохранены', 'success'); });
        const animationsEnabled = document.getElementById('animationsEnabled');
        if (animationsEnabled) animationsEnabled.addEventListener('change', (e) => { this.game.userData.settings.animations = e.target.checked; this.game.saveGame(); this.game.showToast('✅ Настройки анимаций сохранены', 'success'); });
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
        if (newName.length > 20) { this.game.showToast('❌ Никнейм не должен превышать 20 символов', 'error'); return; }
        this.game.userData.settings.displayName = newName;
        await this.game.saveGame();
        const profileUsername = document.getElementById('profileUsername');
        if (profileUsername) profileUsername.textContent = newName;
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) usernameDisplay.textContent = newName;
        this.game.showToast(`✅ Никнейм изменен на "${newName}"`, 'success');
    }
    
    async changePassword() {
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        if (!oldPass || !newPass || !confirmPass) { this.game.showToast('❌ Заполните все поля', 'error'); return; }
        if (newPass !== confirmPass) { this.game.showToast('❌ Новые пароли не совпадают', 'error'); return; }
        if (newPass.length < 4) { this.game.showToast('❌ Пароль должен быть не менее 4 символов', 'error'); return; }
        if (oldPass !== this.game.userData.password) { this.game.showToast('❌ Неверный старый пароль', 'error'); return; }
        this.game.userData.password = newPass;
        await this.game.saveGame();
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.game.showToast('✅ Пароль успешно изменен', 'success');
    }
    
    saveTheme(theme) {
        this.game.userData.settings.theme = theme;
        this.game.saveGame();
        const themeNames = { 'dark': 'Тёмная', 'light': 'Светлая', 'auto': 'Как в системе' };
        this.game.showToast(`✅ Тема изменена на ${themeNames[theme] || theme}`, 'success');
        if (theme === 'light') document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        else if (theme === 'dark') document.body.style.background = 'linear-gradient(135deg, #0a0c15 0%, #121520 50%, #0a0c15 100%)';
        else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.body.style.background = 'linear-gradient(135deg, #0a0c15 0%, #121520 50%, #0a0c15 100%)';
            else document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        }
    }
    
    async saveLanguage(lang) {
        this.game.userData.settings.language = lang;
        await this.game.saveGame();
        const langNames = { 'ru': 'Русский', 'en': 'English', 'tr': 'Türkçe', 'es': 'Español' };
        this.game.showToast(`✅ Язык изменен на ${langNames[lang] || lang}`, 'success');
    }
    
    exportData() {
        try {
            const exportData = {
                username: this.game.userData.username,
                displayName: this.game.userData.settings?.displayName || this.game.userData.username,
                clicks: this.game.userData.clicks,
                money: this.game.userData.money,
                dilicks: this.game.userData.dilicks,
                clickPower: this.game.userData.clickPower,
                autoClickerLevel: this.game.userData.autoClickerLevel,
                critChance: this.game.userData.critChance,
                inventory: this.game.userData.inventory,
                currentSkin: this.game.userData.currentSkin,
                seasonLevel: this.game.userData.seasonLevel,
                seasonExp: this.game.userData.seasonExp,
                playtime: this.game.userData.playtime,
                completedAchievements: this.game.userData.completedAchievements,
                compensationReceived: this.game.userData.compensationReceived,
                rechargeBonus: this.game.userData.rechargeBonus || 0,
                clickerMastery: this.game.userData.clickerMastery || 0,
                eventBooster: this.game.userData.eventBooster || 0,
                settings: this.game.userData.settings,
                exportDate: new Date().toLocaleString()
            };
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date();
            const fileName = `dilic_clicker_${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}.json`;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.game.showToast('✅ Данные успешно экспортированы', 'success');
        } catch (error) { console.error(error); this.game.showToast('❌ Ошибка при экспорте данных', 'error'); }
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!confirm('⚠️ Импорт данных заменит текущий прогресс. Продолжить?')) return;
            this.game.showToast('📤 Чтение файла...', 'info');
            try {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        if (!this.validateImportedData(importedData)) { this.game.showToast('❌ Неверный формат файла', 'error'); return; }
                        importedData.username = this.game.userData.username;
                        importedData.password = this.game.userData.password;
                        this.game.userData = importedData;
                        await this.game.saveGame();
                        this.updateUI();
                        this.game.updateUI();
                        this.game.updateInventory();
                        this.game.updateShopStatus();
                        this.game.renderUpgrades();
                        this.game.showToast('✅ Данные успешно импортированы', 'success');
                    } catch (parseError) { this.game.showToast('❌ Ошибка чтения файла: неверный формат JSON', 'error'); }
                };
                reader.readAsText(file);
            } catch (error) { console.error(error); this.game.showToast('❌ Ошибка при импорте данных', 'error'); }
        };
        input.click();
    }
    
    validateImportedData(data) {
        const requiredFields = ['clicks', 'money', 'dilicks', 'clickPower', 'inventory', 'currentSkin'];
        for (const field of requiredFields) if (!(field in data)) { console.error(`Отсутствует поле: ${field}`); return false; }
        if (typeof data.clicks !== 'number' || typeof data.money !== 'number' || typeof data.dilicks !== 'number') { console.error('Неверные типы данных'); return false; }
        if (!Array.isArray(data.inventory)) { console.error('Инвентарь должен быть массивом'); return false; }
        return true;
    }
    
    confirmResetProgress() { this.showModal('🔄 Сброс прогресса', 'Вы уверены, что хотите сбросить весь прогресс? Все клики, деньги и дилики будут обнулены. Это действие нельзя отменить.', () => this.resetProgress()); }
    
    async resetProgress() {
        const username = this.game.userData.username;
        const password = this.game.userData.password;
        const resetData = {
            clicks: 0, money: 1000, dilicks: 500, clickPower: 1, autoClickerLevel: 0, critChance: 5,
            inventory: ['classic'], currentSkin: 'classic', seasonLevel: 1, seasonExp: 0, playtime: 0,
            premiumPass: false, completedAchievements: [], activatedPromocodes: [], promocodesHistory: [],
            compensationReceived: false, rechargeBonus: 0, clickerMastery: 0, eventBooster: 0,
            settings: this.game.userData.settings, lastSave: Date.now(),
            username: username, password: password
        };
        this.game.userData = resetData;
        await this.game.saveGame();
        this.game.updateUI();
        this.game.updateInventory();
        this.game.updateShopStatus();
        this.game.renderUpgrades();
        this.updateUI();
        this.game.showToast('✅ Прогресс сброшен', 'success');
    }
    
    confirmDeleteAccount() { this.showModal('🗑️ Удаление аккаунта', 'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить. Все данные будут потеряны навсегда.', () => this.deleteAccount()); }
    
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
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
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
            if (data && data.active && data.spinCost) {
                this.SPIN_COST = data.spinCost;
                if (this.costSpan) this.costSpan.textContent = this.SPIN_COST;
            }
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
            this.game.showToast(`❌ Недостаточно диликов! Нужно: ${this.SPIN_COST} ${this.game.getDilicksIcon()}`, 'error');
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
                this.game.showAchievementNotification({ name: 'ОСОБЕННЫЙ СКИН', icon: this.game.skinsData[this.SKIN_ID].image, reward: { money: 0, dilicks: 0 } });
                this.game.showToast(`🎉 ПОЗДРАВЛЯЕМ! Вы получили легендарный скин дракона с множителем x250! ${this.game.getDilicksIcon()}`, 'success');
            } else {
                this.game.userData.dilicks += 10000;
                resultHTML = `<span> +10000</span><img src="${this.DILICKS_ICON}" class="wheel-result-icon"><span>(скин уже был)</span>`;
                this.resultDisplay.style.color = 'gold';
                this.resultDisplay.style.textShadow = '0 0 20px gold';
                this.game.showToast(` +10000 ${this.game.getDilicksIcon()} (скин уже был)`, 'success');
            }
        } else if (prize.type === 'money') {
            this.game.userData.money += prize.value;
            resultHTML = `<span>+${prize.value.toLocaleString()}</span><img src="${this.MONEY_ICON}" class="wheel-result-icon">`;
            this.game.showToast(` +${prize.value.toLocaleString()} ${this.game.getMoneyIcon()}`, 'success');
        } else {
            this.game.userData.dilicks += prize.value;
            resultHTML = `<span>+${prize.value.toLocaleString()}</span><img src="${this.DILICKS_ICON}" class="wheel-result-icon">`;
            this.game.showToast(` +${prize.value.toLocaleString()} ${this.game.getDilicksIcon()}`, 'success');
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
// ЗАПУСК ИГРЫ
// ============================================

document.addEventListener('DOMContentLoaded', () => { 
    window.clickerGame = new ClickerGame(); 
});

// ===== ЭКРАНЫ ТЕХРАБОТ =====
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

// ========== УПРАВЛЕНИЕ ЭКРАНАМИ ТЕХРАБОТ ==========
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

function initScreens() {
    checkAllScreens();
    listenScreenChanges();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScreens);
} else {
    initScreens();
}

// ===== ПРИНУДИТЕЛЬНОЕ ПРИМЕНЕНИЕ ЭМОДЗИ В РЕЖИМЕ ПРОИЗВОДИТЕЛЬНОСТИ =====
(function fixPerformanceMode() {
    const perfCheckbox = document.getElementById('performanceMode');
    if (!perfCheckbox) return;
    
    function updateNavButtonsDisplay() {
        const isPerformanceMode = document.body.classList.contains('no-liquid-animations');
        const isMobile = window.innerWidth <= 768;
        const navBtns = document.querySelectorAll('.nav-btn');
        
        navBtns.forEach(btn => {
            const textSpan = btn.querySelector('.nav-text');
            if (!textSpan) return;
            
            if (isPerformanceMode && isMobile) {
                textSpan.style.display = 'none';
            } else {
                textSpan.style.display = '';
            }
        });
    }
    
    const observer = new MutationObserver(() => {
        updateNavButtonsDisplay();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    window.addEventListener('resize', updateNavButtonsDisplay);
    updateNavButtonsDisplay();
    
    console.log('✅ Режим производительности: эмодзи для мобилок готов');
})();