import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  getDocs,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  startAfter,
} from "firebase/firestore";
import { app, db, auth } from "./config";

// ── FCM Push Notifications ──
let messaging = null;

function getMessagingInstance() {
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      return null;
    }
  }
  return messaging;
}

export async function requestNotificationPermission() {
  const m = getMessagingInstance();
  if (!m) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const token = await getToken(m, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback) {
  const m = getMessagingInstance();
  if (!m) return () => {};
  return onMessage(m, callback);
}

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch {}
  }
}

export function showLocalNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-192.svg", badge: "/favicon.svg" });
  }
}

// ── Channels ──
export async function createChannel({ name, members, type = "group", createdBy }) {
  const channelRef = await addDoc(collection(db, "channels"), {
    name,
    type,
    members: [createdBy, ...members],
    createdBy,
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    lastMessageSender: null,
    unreadCounts: {},
  });
  return channelRef.id;
}

export async function createDM(user1, user2) {
  const q = query(
    collection(db, "channels"),
    where("type", "==", "dm"),
    where("members", "array-contains", user1)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const data = d.data();
    return data.members.includes(user2) && data.members.length === 2;
  });
  if (existing) return existing.id;
  return createChannel({
    name: "",
    members: [user2],
    type: "dm",
    createdBy: user1,
  });
}

export function listenChannels(userId, callback) {
  const q = query(
    collection(db, "channels"),
    where("members", "array-contains", userId)
  );
  return onSnapshot(q, (snap) => {
    const channels = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    channels.sort((a, b) => {
      const aTime = a.lastMessageAt?.toMillis?.() || 0;
      const bTime = b.lastMessageAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(channels);
  });
}

// ── Messages ──
export async function sendMessage(channelId, { text, senderId, senderName, senderPhoto, replyTo, type = "text", mediaUrl }) {
  const msgData = {
    text,
    senderId,
    senderName,
    senderPhoto: senderPhoto || null,
    timestamp: serverTimestamp(),
    readBy: [senderId],
    replyTo: replyTo || null,
    type,
    mediaUrl: mediaUrl || null,
    reactions: {},
  };
  const msgRef = await addDoc(collection(db, "channels", channelId, "messages"), msgData);

  await updateDoc(doc(db, "channels", channelId), {
    lastMessage: text || (type === "image" ? "\u{1F4F7} Image" : "\u{1F4CE} File"),
    lastMessageAt: serverTimestamp(),
    lastMessageSender: senderId,
  });

  return msgRef.id;
}

export function listenMessages(channelId, callback, lastVisible = null, pageSize = 50) {
  let q;
  if (lastVisible) {
    q = query(
      collection(db, "channels", channelId, "messages"),
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, "channels", channelId, "messages"),
      orderBy("timestamp", "desc"),
      limit(pageSize)
    );
  }
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    messages.reverse();
    callback(messages, snap.docs[snap.docs.length - 1]);
  });
}

export async function markAsRead(channelId, messageId, userId) {
  const msgRef = doc(db, "channels", channelId, "messages", messageId);
  await updateDoc(msgRef, {
    readBy: arrayUnion(userId),
  });
}

export async function markAllAsRead(channelId, userId, unreadMessages) {
  const batch = writeBatch(db);
  unreadMessages.forEach((msg) => {
    const msgRef = doc(db, "channels", channelId, "messages", msg.id);
    batch.update(msgRef, { readBy: arrayUnion(userId) });
  });
  await batch.commit();
}

// ── Reactions ──
export async function toggleReaction(channelId, messageId, emoji, userId) {
  const msgRef = doc(db, "channels", channelId, "messages", messageId);
  const msgSnap = await getDoc(msgRef);
  const msgData = msgSnap.data();
  const currentReactions = msgData.reactions || {};
  const users = currentReactions[emoji] || [];

  if (users.includes(userId)) {
    const newUsers = users.filter((u) => u !== userId);
    const newReactions = { ...currentReactions };
    if (newUsers.length === 0) delete newReactions[emoji];
    else newReactions[emoji] = newUsers;
    await updateDoc(msgRef, { reactions: newReactions });
  } else {
    await updateDoc(msgRef, {
      reactions: { ...currentReactions, [emoji]: arrayUnion(userId) },
    });
  }
}

// ── Typing indicators ──
export async function setTyping(channelId, userId, isTyping) {
  const typingRef = doc(db, "channels", channelId, "typing", userId);
  if (isTyping) {
    await setDoc(typingRef, {
      userId,
      timestamp: serverTimestamp(),
    });
  } else {
    await setDoc(typingRef, {
      userId,
      timestamp: serverTimestamp(),
      stopped: true,
    });
  }
}

export function listenTyping(channelId, callback) {
  const q = query(collection(db, "channels", channelId, "typing"));
  return onSnapshot(q, (snap) => {
    const now = Date.now();
    const typingUsers = snap.docs
      .map((d) => d.data())
      .filter((t) => {
        if (t.stopped) return false;
        const time = t.timestamp?.toMillis?.() || 0;
        return now - time < 5000;
      })
      .map((t) => t.userId);
    callback(typingUsers);
  });
}

// ── Presence ──
export async function setOnline(userId, online) {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      online,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateProfile(userId, data) {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, data, { merge: true });
}

export function listenOnlineUsers(callback) {
  const q = query(collection(db, "users"), where("online", "==", true));
  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    callback(users);
  });
}

export function listenUser(userId, callback) {
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) callback({ uid: snap.id, ...snap.data() });
    else callback(null);
  });
}

// ── User search ──
export async function searchUsers(searchTerm) {
  const q = query(collection(db, "users"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter(
      (u) =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// ── Channel members ──
export async function addMemberToChannel(channelId, userId) {
  await updateDoc(doc(db, "channels", channelId), {
    members: arrayUnion(userId),
  });
}

export async function removeMemberFromChannel(channelId, userId) {
  await updateDoc(doc(db, "channels", channelId), {
    members: arrayRemove(userId),
  });
}
