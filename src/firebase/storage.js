import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
} from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  getDocs,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { storage, db } from "./config";

// ── File Upload ──
export function uploadFile(file, folderPath, userId, onProgress) {
  const filePath = folderPath
    ? `${folderPath}/${file.name}`
    : `${userId}/${file.name}`;
  const storageRef = ref(storage, `documents/${filePath}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        const metadata = await getMetadata(uploadTask.snapshot.ref);
        resolve({ url, metadata, path: filePath });
      }
    );
  });
}

// ── File Download URL ──
export async function getFileUrl(path) {
  const storageRef = ref(storage, `documents/${path}`);
  return getDownloadURL(storageRef);
}

// ── File Delete ──
export async function deleteFile(path) {
  const storageRef = ref(storage, `documents/${path}`);
  return deleteObject(storageRef);
}

// ── List Files in Folder ──
export async function listFiles(folderPath) {
  const storageRef = ref(
    storage,
    folderPath ? `documents/${folderPath}` : "documents"
  );
  const result = await listAll(storageRef);
  return Promise.all(
    result.items.map(async (item) => {
      const metadata = await getMetadata(item);
      const url = await getDownloadURL(item);
      return {
        name: item.name,
        path: item.fullPath.replace("documents/", ""),
        url,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        customMetadata: metadata.customMetadata || {},
      };
    })
  );
}

// ── Folders (stored in Firestore) ──
export async function createFolder(name, parentId, userId) {
  const folderRef = await addDoc(collection(db, "folders"), {
    name,
    parentId: parentId || null,
    createdBy: userId,
    createdAt: serverTimestamp(),
    sharedWith: [],
  });
  return folderRef.id;
}

export function listenFolders(userId, callback) {
  const q = query(
    collection(db, "folders"),
    where("sharedWith", "array-contains-any", [userId, "all"])
  );
  return onSnapshot(q, (snap) => {
    const folders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(folders);
  });
}

export async function deleteFolder(folderId) {
  await deleteDoc(doc(db, "folders", folderId));
}

// ── Document metadata (stored in Firestore for search/sharing) ──
export async function saveDocMeta({ name, path, folderId, uploadedBy, url, size, contentType }) {
  const docRef = await addDoc(collection(db, "documents"), {
    name,
    path,
    folderId: folderId || null,
    uploadedBy,
    url,
    size,
    contentType,
    createdAt: serverTimestamp(),
    sharedWith: [],
    starred: false,
  });
  return docRef.id;
}

export function listenDocuments(userId, folderId, callback) {
  let q;
  if (folderId) {
    q = query(
      collection(db, "documents"),
      where("folderId", "==", folderId)
    );
  } else {
    q = query(
      collection(db, "documents"),
      where("sharedWith", "array-contains-any", [userId, "all"])
    );
  }
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(docs);
  });
}

export async function updateDocMeta(docId, updates) {
  await updateDoc(doc(db, "documents", docId), updates);
}

export async function deleteDocMeta(docId) {
  await deleteDoc(doc(db, "documents", docId));
}

export async function toggleStar(docId, starred) {
  await updateDoc(doc(db, "documents", docId), { starred });
}

export async function shareDocument(docId, userIds) {
  await updateDoc(doc(db, "documents", docId), {
    sharedWith: arrayUnion(...userIds),
  });
}

export async function unshareDocument(docId, userIds) {
  await updateDoc(doc(db, "documents", docId), {
    sharedWith: arrayRemove(...userIds),
  });
}
