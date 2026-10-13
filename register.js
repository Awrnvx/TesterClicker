// register.js
localStorage.removeItem('currentUser');
localStorage.removeItem('userId');

class UserManager {
    constructor() {
        this.currentUser = null;
    }

    async register(username, password) {
        try {
            const snapshot = await firebase.database().ref('users').orderByChild('username').equalTo(username).once('value');
            
            if (snapshot.exists()) {
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
            
            const snapshot = await firebase.database().ref('users').orderByChild('username').equalTo(username).once('value');
            
            if (!snapshot.exists()) {
                console.log('❌ Пользователь не найден');
                return { success: false, message: 'Неверный логин или пароль' };
            }
            
            let userData = null;
            let userId = null;
            
            snapshot.forEach(child => {
                userData = child.val();
                userId = child.key;
                console.log('✅ Найден пользователь:', userData.username, 'ID:', userId);
            });
            
            if (userData.password !== password) {
                console.log('❌ Пароль не совпадает');
                return { success: false, message: 'Неверный логин или пароль' };
            }
            
            localStorage.setItem('currentUser', userData.username);
            localStorage.setItem('userId', userId);
            
            console.log('✅ Вход выполнен для:', userData.username);
            return { success: true, message: 'Вход выполнен', userId: userId, userData: userData };
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            return { success: false, message: 'Ошибка при входе' };
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
        
        const result = await userManager.login(username, password);
        
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