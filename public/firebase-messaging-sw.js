importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBUtquLIvk3Gp6yvaz5Ys6ArGBfnHn3pIg",
  authDomain: "check-list-25153.firebaseapp.com",
  projectId: "check-list-25153",
  storageBucket: "check-list-25153.firebasestorage.app",
  messagingSenderId: "366037146124",
  appId: "1:366037146124:web:0b50d12de50f7ad4d26c29",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "MileStone MindSet";
  const options = {
    body: payload.notification?.body || "You have a deadline reminder",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: "deadline-reminder",
  };
  self.registration.showNotification(title, options);
});
