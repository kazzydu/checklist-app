import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Users,
  Check,
  X,
} from "lucide-react";
import {
  createChannel,
  createDM,
  searchUsers,
  listenOnlineUsers,
} from "../firebase/messaging";

export default function ChannelCreate({ user, darkMode, onBack, onChannelCreated }) {
  const [mode, setMode] = useState("choose"); // choose, group, dm
  const [channelName, setChannelName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = listenOnlineUsers(setOnlineUsers);
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(onlineUsers.filter((u) => u.uid !== user.uid));
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchUsers(searchTerm);
      setSearchResults(results.filter((u) => u.uid !== user.uid));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onlineUsers, user.uid]);

  const toggleUser = (uid) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    );
  };

  const handleCreate = async () => {
    if (mode === "group" && !channelName.trim()) return;
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      if (mode === "dm" && selectedUsers.length === 1) {
        const channelId = await createDM(user.uid, selectedUsers[0]);
        const channel = { id: channelId, type: "dm", members: [user.uid, selectedUsers[0]] };
        onChannelCreated(channel);
      } else {
        const channelId = await createChannel({
          name: channelName.trim(),
          members: selectedUsers,
          type: "group",
          createdBy: user.uid,
        });
        const channel = {
          id: channelId,
          name: channelName.trim(),
          type: "group",
          members: [user.uid, ...selectedUsers],
        };
        onChannelCreated(channel);
      }
    } catch (e) {
      console.error("Failed to create channel:", e);
    }
    setLoading(false);
  };

  const bg = darkMode ? "bg-gray-900" : "bg-white";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";

  if (mode === "choose") {
    return (
      <div className={`min-h-screen ${bg}`}>
        <div className={`${cardBg} border-b ${border} px-4 py-3 flex items-center gap-3`}>
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft size={20} className={textPrimary} />
          </button>
          <h1 className={`font-bold ${textPrimary}`}>New Conversation</h1>
        </div>
        <div className="p-4 space-y-3">
          <button
            onClick={() => setMode("group")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${border} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <div className={`font-semibold text-sm ${textPrimary}`}>New Group</div>
              <div className={`text-xs ${textSecondary}`}>Create a channel for your team</div>
            </div>
          </button>
          <button
            onClick={() => setMode("dm")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${border} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-left">
              <div className={`font-semibold text-sm ${textPrimary}`}>Direct Message</div>
              <div className={`text-xs ${textSecondary}`}>Send a private message</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className={`${cardBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setMode("choose")} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft size={20} className={textPrimary} />
          </button>
          <h1 className={`font-bold ${textPrimary}`}>
            {mode === "group" ? "New Group" : "New Message"}
          </h1>
        </div>

        {mode === "group" && (
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Group name..."
            className={`w-full px-4 py-2.5 rounded-xl text-sm mb-3 ${
              darkMode
                ? "bg-gray-700 text-white placeholder:text-gray-500"
                : "bg-gray-100 text-gray-900 placeholder:text-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        )}

        {/* Selected users chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedUsers.map((uid) => {
              const profile = onlineUsers.find((u) => u.uid === uid);
              return (
                <div
                  key={uid}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs"
                >
                  <span className="font-medium truncate max-w-[100px]">
                    {profile?.displayName || "Unknown"}
                  </span>
                  <button onClick={() => toggleUser(uid)}>
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search people..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${
              darkMode
                ? "bg-gray-700 text-white placeholder:text-gray-500"
                : "bg-gray-100 text-gray-900 placeholder:text-gray-40"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {searchResults.map((u) => {
          const selected = selectedUsers.includes(u.uid);
          return (
            <button
              key={u.uid}
              onClick={() => toggleUser(u.uid)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                selected
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {u.photoURL ? (
                <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {u.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <div className={`text-sm font-semibold truncate ${textPrimary}`}>
                  {u.displayName || "Unknown"}
                </div>
                <div className={`text-xs truncate ${textSecondary}`}>{u.email}</div>
              </div>
              {selected && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Create button */}
      {selectedUsers.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 p-4 ${cardBg} border-t ${border}`}>
          <button
            onClick={handleCreate}
            disabled={loading || (mode === "group" && !channelName.trim())}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : mode === "dm"
              ? "Start Conversation"
              : `Create Group (${selectedUsers.length + 1})`}
          </button>
        </div>
      )}
    </div>
  );
}
