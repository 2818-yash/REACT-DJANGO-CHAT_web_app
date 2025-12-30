import { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "./addUser/AddUser";

function ChatList({ user, onSelectUser, activeChatUser }) {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const loadChats = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/chats/?user_id=${user.id}`
        );

        if (!res.ok) return;

        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadChats();
  }, [user]);

  const handleAddUser = (chatUser) => {
    setChats((prev) => {
      if (prev.find((c) => c.id === chatUser.id)) return prev;
      return [...prev, chatUser];
    });
    setAddMode(false);
  };

  const handleRemoveUser = async (chatUser) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/chats/remove/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          target_user_id: chatUser.id,
        }),
      });

      if (!res.ok) return;

      setChats((prev) =>
        prev.filter((c) => c.id !== chatUser.id)
      );

      // ✅ RESET CHAT + DETAILS
      if (activeChatUser?.id === chatUser.id) {
        onSelectUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "/minus.png" : "/plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((p) => !p)}
        />
      </div>

      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`item ${
            activeChatUser?.id === chat.id ? "active" : ""
          }`}
          onClick={() => onSelectUser(chat)}
        >
          <img src={chat.avatar || "/avatar.png"} alt="" />
          <div className="texts">
            <span>{chat.username}</span>
            <p>Start chatting</p>
          </div>

          <button
            className="remove"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveUser(chat);
            }}
          >
            Remove
          </button>
        </div>
      ))}

      {addMode && (
        <AddUser onAdd={handleAddUser} currentUser={user} />
      )}
    </div>
  );
}

export default ChatList;