import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Send,
  Smile,
  Reply,
  MoreVertical,
  Users,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Paperclip,
  X,
  Hash,
} from "lucide-react";
import {
  sendMessage,
  listenMessages,
  markAllAsRead,
  toggleReaction,
  setTyping,
  listenTyping,
  listenUser,
  listenOnlineUsers,
} from "../firebase/messaging";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts.toMillis?.() || ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts.toMillis?.() || ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatView({
  channel,
  user,
  darkMode,
  onBack,
  onOpenThread,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  const unsubRef = useRef(null);
  const unsubTyping = useRef(null);

  useEffect(() => {
    if (!channel?.id) return;
    unsubRef.current = listenMessages(channel.id, (msgs) => {
      setMessages(msgs);
      const unread = msgs.filter(
        (m) => m.senderId !== user.uid && !m.readBy?.includes(user.uid)
      );
      if (unread.length > 0) markAllAsRead(channel.id, user.uid, unread);
    });
    unsubTyping.current = listenTyping(channel.id, setTypingUsers);
    return () => {
      unsubRef.current?.();
      unsubTyping.current?.();
    };
  }, [channel?.id, user.uid]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubs = [];
    channel?.members?.forEach((uid) => {
      if (uid !== user.uid) {
        unsubs.push(
          listenUser(uid, (u) => {
            if (u) setMemberProfiles((p) => ({ ...p, [uid]: u }));
          })
        );
      }
    });
    return () => unsubs.forEach((u) => u());
  }, [channel?.members, user.uid]);

  const handleTypingStart = useCallback(() => {
    setTyping(channel.id, user.uid, true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(channel.id, user.uid, false);
    }, 3000);
  }, [channel.id, user.uid]);

  const handleSend = async () => {
    if (!text.trim()) return;
    clearTimeout(typingTimeout.current);
    setTyping(channel.id, user.uid, false);
    await sendMessage(channel.id, {
      text: text.trim(),
      senderId: user.uid,
      senderName: user.displayName || "Anonymous",
      senderPhoto: user.photoURL,
      replyTo: replyTo?.id || null,
    });
    setText("");
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleReaction = async (msgId, emoji) => {
    await toggleReaction(channel.id, msgId, emoji, user.uid);
    setShowEmoji(null);
  };

  const otherTyping = typingUsers.filter((uid) => uid !== user.uid);
  const otherTypingName =
    otherTyping.length === 1
      ? memberProfiles[otherTyping[0]]?.displayName?.split(" ")[0]
      : otherTyping.length > 1
      ? `${otherTyping.length} people`
      : null;

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";

  const channelName =
    channel.type === "dm"
      ? memberProfiles[channel.members?.find((m) => m !== user.uid)]?.displayName || "Chat"
      : channel.name || "Channel";

  return (
    <div className={`flex flex-col h-screen ${bg}`}>
      {/* Header */}
      <div
        className={`${cardBg} border-b ${border} px-4 py-3 flex items-center gap-3 flex-shrink-0`}
      >
        <button
          onClick={onBack}
          className={`p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
        >
          <ArrowLeft size={20} className={textPrimary} />
        </button>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm ${textPrimary} truncate`}>
            {channel.type === "group" && (
              <Hash size={14} className="inline mr-1 opacity-50" />
            )}
            {channelName}
          </div>
          {otherTypingName ? (
            <div className="text-xs text-green-500 animate-pulse">
              {otherTypingName} is typing...
            </div>
          ) : (
            <div className={`text-xs ${textSecondary}`}>
              {channel.members?.length || 0} members
            </div>
          )}
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
        >
          <MoreVertical size={18} className={textSecondary} />
        </button>
      </div>

      {/* Members panel */}
      {showInfo && (
        <div
          className={`${cardBg} border-b ${border} px-4 py-3 max-h-48 overflow-y-auto flex-shrink-0`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${textSecondary}`}>
            Members
          </h3>
          <div className="space-y-2">
            {channel.members?.map((uid) => {
              const profile =
                uid === user.uid
                  ? { displayName: "You", photoURL: user.photoURL }
                  : memberProfiles[uid];
              const isOnline = onlineUsers.some((u) => u.uid === uid);
              return (
                <div key={uid} className="flex items-center gap-2">
                  <div className="relative">
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {profile?.displayName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${textPrimary}`}>
                    {profile?.displayName || "Unknown"}
                    {uid === user.uid && (
                      <span className={`text-xs ml-1 ${textSecondary}`}>(you)</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user.uid;
          const showDate =
            idx === 0 ||
            formatDate(msg.timestamp) !==
              formatDate(messages[idx - 1]?.timestamp);
          const showSender =
            idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
          const isLastInGroup =
            idx === messages.length - 1 ||
            messages[idx + 1]?.senderId !== msg.senderId;

          const replyMsg = msg.replyTo
            ? messages.find((m) => m.id === msg.replyTo)
            : null;

          const readCount = msg.readBy?.length || 0;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center py-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                  showSender ? "mt-2" : "mt-0.5"
                }`}
              >
                <div
                  className={`max-w-[80%] relative group ${
                    isMe
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                      : darkMode
                      ? "bg-gray-800 text-white rounded-2xl rounded-bl-md"
                      : "bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm"
                  } px-3 py-2`}
                >
                  {/* Reply preview */}
                  {replyMsg && (
                    <div
                      className={`text-xs mb-1 pl-2 border-l-2 ${
                        isMe
                          ? "border-blue-300 text-blue-200"
                          : "border-gray-400 text-gray-400"
                      }`}
                    >
                      <span className="font-semibold">{replyMsg.senderName}</span>
                      <br />
                      <span className="opacity-75 truncate block">
                        {replyMsg.text || "Media"}
                      </span>
                    </div>
                  )}

                  {/* Sender name in groups */}
                  {!isMe && showSender && channel.type === "group" && (
                    <div className="text-xs font-semibold text-blue-500 mb-0.5">
                      {msg.senderName}
                    </div>
                  )}

                  {/* Message text */}
                  <div className="text-sm break-words whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Time + read receipt */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-0.5 ${
                      isMe ? "text-blue-200" : textSecondary
                    }`}
                  >
                    <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                    {isMe && (
                      readCount > 1 ? (
                        <CheckCheck size={14} className="text-blue-300" />
                      ) : (
                        <Check size={14} />
                      )
                    )}
                  </div>

                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                            users.includes(user.uid)
                              ? "bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-400"
                              : darkMode
                              ? "bg-gray-700"
                              : "bg-gray-100"
                          }`}
                        >
                          {emoji}{" "}
                          <span className="text-[10px]">{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hover actions */}
                  {showEmoji === msg.id ? (
                    <div
                      className={`absolute ${
                        isMe ? "right-0" : "left-0"
                      } -top-10 flex gap-1 rounded-full px-2 py-1.5 shadow-lg z-10 ${
                        darkMode ? "bg-gray-700" : "bg-white border"
                      }`}
                    >
                      {REACTION_EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => handleReaction(msg.id, e)}
                          className="text-lg hover:scale-125 transition-transform"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`absolute ${
                        isMe ? "left-0 -translate-x-full" : "right-0 translate-x-full"
                      } top-0 hidden group-hover:flex gap-0.5 px-1`}
                    >
                      <button
                        onClick={() =>
                          setReplyTo({
                            id: msg.id,
                            text: msg.text,
                            senderName: msg.senderName,
                          })
                        }
                        className={`p-1 rounded-lg ${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-700`}
                      >
                        <Reply size={14} />
                      </button>
                      <button
                        onClick={() =>
                          setShowEmoji(showEmoji === msg.id ? null : msg.id)
                        }
                        className={`p-1 rounded-lg ${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-700`}
                      >
                        <Smile size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Reply preview bar */}
      {replyTo && (
        <div
          className={`${cardBg} border-t ${border} px-4 py-2 flex items-center gap-2`}
        >
          <Reply size={16} className="text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-blue-500">
              {replyTo.senderName}
            </div>
            <div className={`text-xs truncate ${textSecondary}`}>{replyTo.text}</div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className={`p-1 rounded-lg ${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-700`}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input */}
      <div
        className={`${cardBg} border-t ${border} px-3 py-2 flex items-end gap-2 flex-shrink-0`}
      >
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTypingStart();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className={`w-full px-4 py-2.5 rounded-2xl text-sm resize-none max-h-32 ${
              darkMode
                ? "bg-gray-700 text-white placeholder:text-gray-500"
                : "bg-gray-100 text-gray-900 placeholder:text-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            style={{ minHeight: "40px" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-3 rounded-full transition-colors ${
            text.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : darkMode
              ? "bg-gray-700 text-gray-500"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
