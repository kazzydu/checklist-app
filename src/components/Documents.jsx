import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  Folder,
  FolderPlus,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Star,
  Trash2,
  Share2,
  Download,
  Search,
  X,
  ChevronRight,
  Check,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  uploadFile,
  deleteFile,
  saveDocMeta,
  listenDocuments,
  deleteDocMeta,
  toggleStar,
  shareDocument,
  createFolder,
  listenFolders,
  deleteFolder,
  listFiles,
} from "../firebase/storage";
import { searchUsers, listenUser } from "../firebase/messaging";

const FILE_ICONS = {
  "image/": FileImage,
  "video/": FileVideo,
  "audio/": FileAudio,
  "application/pdf": FileText,
  "application/zip": FileArchive,
  "application/x-zip": FileArchive,
  "text/": FileText,
};

function getFileIcon(contentType) {
  if (!contentType) return File;
  for (const [prefix, Icon] of Object.entries(FILE_ICONS)) {
    if (contentType.startsWith(prefix)) return Icon;
  }
  return File;
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(date) {
  if (!date) return "";
  const then = new Date(date).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Documents({ user, darkMode }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShare, setShowShare] = useState(null);
  const [shareSearch, setShareSearch] = useState("");
  const [shareResults, setShareResults] = useState([]);
  const [shareUsers, setShareUsers] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubDocs = listenDocuments(user.uid, currentFolder, setFiles);
    const unsubFolders = listenFolders(user.uid, setFolders);
    return () => { unsubDocs?.(); unsubFolders?.(); };
  }, [user.uid, currentFolder]);

  useEffect(() => {
    const uids = new Set();
    files.forEach((f) => { if (f.uploadedBy) uids.add(f.uploadedBy); });
    folders.forEach((f) => { if (f.createdBy) uids.add(f.createdBy); });
    const unsubs = [];
    uids.forEach((uid) => {
      if (!userProfiles[uid]) {
        unsubs.push(
          listenUser(uid, (u) => {
            if (u) setUserProfiles((p) => ({ ...p, [uid]: u }));
          })
        );
      }
    });
    return () => unsubs.forEach((u) => u());
  }, [files, folders]);

  const handleUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList.length) return;
    setUploading(true);
    setProgress(0);
    try {
      for (const file of fileList) {
        const folderPath = currentFolder
          ? folderPath.join("/") + "/" + currentFolder
          : "";
        const { url, metadata, path } = await uploadFile(
          file,
          folderPath,
          user.uid,
          setProgress
        );
        await saveDocMeta({
          name: file.name,
          path,
          folderId: currentFolder,
          uploadedBy: user.uid,
          url,
          size: file.size,
          contentType: file.type,
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    try {
      await deleteFile(doc.path);
      await deleteDocMeta(doc.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setSelectedFile(null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), currentFolder, user.uid);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleShare = async () => {
    if (!showShare || shareUsers.length === 0) return;
    await shareDocument(showShare.id, shareUsers.map((u) => u.uid));
    setShowShare(null);
    setShareUsers([]);
    setShareSearch("");
  };

  const handleShareSearch = async (term) => {
    setShareSearch(term);
    if (!term.trim()) { setShareResults([]); return; }
    const results = await searchUsers(term);
    setShareResults(results.filter((u) => u.uid !== user.uid));
  };

  const enterFolder = (folder) => {
    setFolderPath((prev) => [...prev, { id: currentFolder, name: "Root" }]);
    setCurrentFolder(folder.id);
  };

  const goBack = () => {
    if (folderPath.length === 0) return;
    const prev = [...folderPath];
    const last = prev.pop();
    setFolderPath(prev);
    setCurrentFolder(last.id);
  };

  const currentFolders = folders.filter((f) =>
    currentFolder ? f.parentId === currentFolder : !f.parentId
  );
  const currentFiles = files.filter((f) =>
    search
      ? f.name?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const bg = darkMode ? "bg-gray-900" : "bg-white";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center gap-3 mb-3">
          {folderPath.length > 0 ? (
            <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">
              <ArrowLeft size={20} className={textPrimary} />
            </button>
          ) : null}
          <h1 className={`flex-1 font-bold ${textPrimary}`}>
            {folderPath.length > 0 && (
              <span className={`text-sm ${textSecondary} mr-2`}>
                {folderPath.map((f) => f.name || "Root").join(" / ")} /
              </span>
            )}
            Documents
          </h1>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            Upload
          </label>
          <button
            onClick={() => setShowNewFolder(true)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FolderPlus size={18} className={textPrimary} />
          </button>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={textSecondary}>Uploading...</span>
              <span className="text-blue-500 font-semibold">{progress}%</span>
            </div>
            <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${
              darkMode
                ? "bg-gray-700 text-white placeholder:text-gray-500"
                : "bg-gray-100 text-gray-900 placeholder:text-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className={`${cardBg} border-b ${border} px-4 py-3 flex items-center gap-2`}>
          <Folder size={18} className="text-yellow-500" />
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setShowNewFolder(false);
            }}
            placeholder="Folder name..."
            className={`flex-1 px-3 py-2 rounded-xl text-sm ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button onClick={handleCreateFolder} className="p-2 rounded-xl bg-blue-600 text-white">
            <Check size={16} />
          </button>
          <button onClick={() => setShowNewFolder(false)} className={`p-2 rounded-xl ${textSecondary}`}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Folders */}
      {currentFolders.length > 0 && !search && (
        <div className="px-4 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {currentFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => enterFolder(folder)}
                className={`flex items-center gap-2 p-3 rounded-xl border ${border} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left`}
              >
                <Folder size={20} className="text-yellow-500 flex-shrink-0" />
                <span className={`text-sm font-medium truncate ${textPrimary}`}>{folder.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div className="px-4 py-3 space-y-1">
        {currentFiles.length === 0 && currentFolders.length === 0 && (
          <div className="text-center py-16">
            <File size={48} className={`mx-auto mb-4 ${textSecondary} opacity-50`} />
            <p className={`text-sm ${textSecondary}`}>No files yet. Upload something!</p>
          </div>
        )}
        {currentFiles.map((doc) => {
          const Icon = getFileIcon(doc.contentType);
          const isImage = doc.contentType?.startsWith("image/");
          return (
            <div
              key={doc.id}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group`}
            >
              <button
                onClick={() => isImage ? setPreviewUrl(doc.url) : window.open(doc.url, "_blank")}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isImage ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  <Icon size={18} className={isImage ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${textPrimary}`}>{doc.name}</div>
                  <div className={`text-xs ${textSecondary}`}>
                    {formatSize(doc.size)} · {timeAgo(doc.createdAt?.toDate?.() || doc.createdAt)}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleStar(doc.id, !doc.starred)}
                  className={`p-1.5 rounded-lg ${doc.starred ? "text-yellow-500" : textSecondary}`}
                >
                  <Star size={14} fill={doc.starred ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => setShowShare(doc)}
                  className={`p-1.5 rounded-lg ${textSecondary} hover:text-blue-500`}
                >
                  <Share2 size={14} />
                </button>
                <a
                  href={doc.url}
                  download={doc.name}
                  className={`p-1.5 rounded-lg ${textSecondary} hover:text-green-500`}
                >
                  <Download size={14} />
                </a>
                <button
                  onClick={() => handleDelete(doc)}
                  className={`p-1.5 rounded-lg ${textSecondary} hover:text-red-500`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className={`${cardBg} rounded-t-2xl sm:rounded-2xl w-full max-w-md p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold ${textPrimary}`}>Share "{showShare.name}"</h3>
              <button onClick={() => { setShowShare(null); setShareUsers([]); setShareSearch(""); }} className={`p-1 ${textSecondary}`}>
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              value={shareSearch}
              onChange={(e) => handleShareSearch(e.target.value)}
              placeholder="Search people to share with..."
              className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {shareUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {shareUsers.map((u) => (
                  <span key={u.uid} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs">
                    {u.displayName}
                    <button onClick={() => setShareUsers((p) => p.filter((x) => x.uid !== u.uid))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {shareResults.map((u) => (
                <button
                  key={u.uid}
                  onClick={() => {
                    if (!shareUsers.find((x) => x.uid === u.uid)) setShareUsers((p) => [...p, u]);
                    setShareSearch("");
                    setShareResults([]);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left`}
                >
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? "bg-gray-700" : "bg-blue-100"}`}>
                      {u.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <div className={`text-sm font-medium ${textPrimary}`}>{u.displayName}</div>
                    <div className={`text-xs ${textSecondary}`}>{u.email}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleShare}
              disabled={shareUsers.length === 0}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Share with {shareUsers.length || ""} people
            </button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <button onClick={() => setPreviewUrl(null)} className="absolute top-4 right-4 text-white p-2">
            <X size={24} />
          </button>
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
