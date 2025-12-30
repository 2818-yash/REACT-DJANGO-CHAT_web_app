import React, { useEffect, useState, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";

function Chat({ user, activeChatUser }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketReady, setSocketReady] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const socketRef = useRef(null);
  const endRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const WS_BASE = API_BASE
    .replace("https://", "wss://")
    .replace("http://", "ws://");

  // 🔽 Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ HARD RESET WHEN CHAT USER IS REMOVED
  useEffect(() => {
    if (!activeChatUser) {
      setMessages([]);
      setSocketReady(false);
      setText("");
      setIsBlocked(false);

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [activeChatUser]);

  // 🔌 CONNECT SOCKET + LOAD HISTORY
  useEffect(() => {
    if (!activeChatUser?.chat_id) return;

    setMessages([]);
    setSocketReady(false);
    setIsBlocked(false);

    if (socketRef.current) {
      socketRef.current.close();
    }

    // LOAD HISTORY
    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/messages/?chat_id=${activeChatUser.chat_id}`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();

    // OPEN SOCKET
    const ws = new WebSocket(
      `${WS_BASE}/ws/chat/${activeChatUser.chat_id}/`
    );

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setSocketReady(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 🔒 BLOCK HANDLING
      if (data.error === "You are blocked") {
        setIsBlocked(true);
        return;
      }

      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      console.log("❌ WebSocket closed");
      setSocketReady(false);
    };

    socketRef.current = ws;

    return () => ws.close();
  }, [activeChatUser]);

  // 😀 Emoji
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // ✉️ SEND TEXT
  const handleSend = () => {
    if (!text.trim() || !socketReady || isBlocked) return;

    socketRef.current.send(
      JSON.stringify({
        text: text,
        sender: user.id,
      })
    );

    setText("");
  };

  // 🖼 SEND IMAGE
  const handleImageSend = async (e) => {
    if (isBlocked) return;

    const file = e.target.files[0];
    if (!file || !activeChatUser?.chat_id) return;

    const formData = new FormData();
    formData.append("chat_id", activeChatUser.chat_id);
    formData.append("sender_id", user.id);
    formData.append("image", file);

    try {
      await fetch(
        `${API_BASE}/api/chats/?user_id=${user.id}`,
        {
          method: "POST",
          body: formData,
        }
      );
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  // 🕒 Time
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ✅ STOP RENDERING CHAT WHEN NO USER
  if (!activeChatUser) {
    return (
      <div className="chat">
        <div className="top">
          <div className="user">
            <img src="/avatar.png" alt="" />
            <div className="texts">
              <span>Select a user</span>
              <p>No active chat</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      {/* TOP */}
      <div className="top">
        <div className="user">
          <img src={activeChatUser.avatar || "/avatar.png"} alt="" />
          <div className="texts">
            <span>{activeChatUser.username}</span>
            <p>
              {isBlocked
                ? "You are blocked"
                : socketReady
                ? "Online"
                : "Connecting..."}
            </p>
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="center">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message ${msg.sender === user.id ? "own" : ""}`}
          >
            <div className="texts">
              {msg.image ? (
                <img src={msg.image} alt="chat" className="chat-image" />
              ) : (
                <p>{msg.text}</p>
              )}
              <span>{formatTime(msg.created_at)}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* BOTTOM */}
      <div className="bottom">
        <label htmlFor="imgUpload">
          <img src="./img.png" alt="img" />
        </label>

        <input
          type="file"
          id="imgUpload"
          hidden
          accept="image/*"
          onChange={handleImageSend}
          disabled={isBlocked}
        />

        <input
          type="text"
          placeholder={
            isBlocked
              ? "You can’t message this user"
              : socketReady
              ? "Type message"
              : "Connecting..."
          }
          value={text}
          disabled={!socketReady || isBlocked}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => !isBlocked && setOpen((p) => !p)}
          />
          <EmojiPicker open={open && !isBlocked} onEmojiClick={handleEmoji} />
        </div>

        <button onClick={handleSend} disabled={!socketReady || isBlocked}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
