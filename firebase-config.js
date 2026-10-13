const firebaseConfig = {
    apiKey: "AIzaSyBHcptZefbC53BR6wMPEtyIF9GCx2y7xjw",
    authDomain: "dilic-clicker.firebaseapp.com",
    databaseURL: "https://dilic-clicker-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dilic-clicker",
    storageBucket: "dilic-clicker.firebasestorage.app",
    messagingSenderId: "651188156647",
    appId: "1:651188156647:web:7ef858931f7fb4526b8a42"
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ID создателя (замени на свой)
const CREATOR_ID = "-P2SMujLobiiisghghw7";

// Проверка подключения к Firebase
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
        console.log('✅ Firebase подключен!');
    } else {
        console.log('❌ Firebase НЕ подключен!');
    }
});

console.log("🔥 Firebase инициализирован");
console.log("👑 CREATOR_ID:", CREATOR_ID);