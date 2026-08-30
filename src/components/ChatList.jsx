import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Users,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import {
  listenChannels,
  listenUser,
  listenOnlineUsers,
} from "../firebase/messaging";

function timeAgo(ts) {
  if (!ts) return "";
  const now = Date.now();
  const then = ts.toMillis?.() || new Date(ts).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ChatList({ user, darkMode, onSelectChannel, onCreateChannel }) {
  const [channels, setChannels] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [search, setSearch] = useState("");
  const unsubChannels = useRef(null);
  const unsubOnline = useRef(null);

  useEffect(() => {
    if (!user) return;
    unsubChannels.current = listenChannels(user.uid, setChannels);
    unsubOnline.current = listenOnlineUsers(setOnlineUsers);
    return () => {
      unsubChannels.current?.();
      unsubOnline.current?.();
    };
  }, [user]);

  useEffect(() => {
    const uids = new Set();
    channels.forEach((ch) => {
      ch.members?.forEach((m) => {
        if (m !== user?.uid) uids.add(m);
      });
    });
    const unsubs = [];
    uids.forEach((uid) => {
      if (!userProfiles[uid]) {
        unsubs.push(
          listenUser(uid, (u) => {
            if (u) setUserProfiles((prev) => ({ ...prev, [uid]: u }));
          })
        );
      }
    });
    return () => unsubs.forEach((u) => u());
  }, [channels, user]);

  const onlineSet = new Set(onlineUsers.map((u) => u.uid));

  const getOtherUser = (ch) => {
    if (ch.type !== "dm") return null;
    const otherId = ch.members?.find((m) => m !== user?.uid);
    return otherId ? userProfiles[otherId] : null;
  };

  const filtered = channels.filter((ch) => {
    if (!search) return true;
    if (ch.type === "dm") {
      const other = getOtherUser(ch);
      return other?.displayName?.toLowerCase().includes(search.toLowerCase());
    }
    return ch.name?.toLowerCase().includes(search.toLowerCase());
  });

  const bg = darkMode ? "bg-gray-900" : "bg-white";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className={`${cardBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className={`text-xl font-bold ${textPrimary}`}>Messages</h1>
          <button
            onClick={onCreateChannel}
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="relative">
          <Search
            size={16}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${
              darkMode
                ? "bg-gray-700 text-white placeholder:text-gray-500"
                : "bg-gray-100 text-gray-900 placeholder:text-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle
              size={48}
              className={`mx-auto mb-4 ${textSecondary} opacity-50`}
            />
            <p className={`text-sm ${textSecondary}`}>
              No conversations yet. Start one!
            </p>
          </div>
        )}
        {filtered.map((ch) => {
          const other = getOtherUser(ch);
          const isOnline = other && onlineSet.has(other.uid);
          const displayName =
            ch.type === "dm"
              ? other?.displayName || "Unknown"
              : ch.name || "Channel";
          const photo =
            ch.type === "dm" ? other?.photoURL : null;

          return (
            <button
              key={ch.id}
              onClick={() => onSelectChannel(ch)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left`}
            >
              <div className="relative flex-shrink-0">
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      darkMode ? "bg-gray-700" : "bg-blue-100"
                    }`}
                  >
                    {ch.type === "dm" ? (
                      <MessageCircle
                        size={20}
                        className={darkMode ? "text-gray-400" : "text-blue-600"}
                      />
                    ) : (
                      <Users
                        size={20}
                        className={darkMode ? "text-gray-400" : "text-blue-600"}
                      />
                    )}
                  </div>
                )}
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-sm truncate ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {displayName}
                  </span>
                  <span className={`text-xs ${textSecondary} flex-shrink-0 ml-2`}>
                    {timeAgo(ch.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs truncate ${textSecondary}`}>
                    {ch.lastMessage || "No messages yet"}
                  </span>
                  {ch.type !== "dm" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                        darkMode
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {ch.members?.length || 0}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
