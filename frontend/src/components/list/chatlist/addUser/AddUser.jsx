import { useEffect, useState } from "react";
import "./adduser.css";

function AddUser({ onAdd, currentUser }) {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ LOAD SUGGESTED USERS
  useEffect(() => {
    if (!currentUser?.id) return;

    const loadSuggestedUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/users/search/?q="
        );
        if (!res.ok) return;

        const data = await res.json();

        const filtered = data.filter(
          (u) => u.id !== currentUser.id
        );

        // 🎯 ADD FAKE ONLINE STATUS (UI ONLY)
        const withStatus = filtered.map((u) => ({
          ...u,
          online: Math.random() > 0.5,
        }));

        setResults(withStatus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestedUsers();
  }, [currentUser]);

  // 🔍 SEARCH (UNCHANGED)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/search/?q=${username}`
      );
      if (!res.ok) return;

      const data = await res.json();

      const filtered = data
        .filter((u) => u.id !== currentUser.id)
        .map((u) => ({
          ...u,
          online: Math.random() > 0.5,
        }));

      setResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ ADD USER (UNCHANGED)
  const handleAddUser = async (targetUser) => {
    if (!currentUser?.id) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chats/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          target_user_id: targetUser.id,
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      onAdd(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="adduser">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* ⭐ SUGGESTED LABEL */}
      {!username && results.length > 0 && (
        <p className="suggested-title">Suggested for you</p>
      )}

      {results.map((user) => (
        <div className="user" key={user.id}>
          <div className="details">
            <div className="avatar-wrapper">
              <img src={user.avatar || "/avatar.png"} alt="" />
              <span
                className={`status-dot ${
                  user.online ? "online" : "offline"
                }`}
              />
            </div>
            <span>{user.username}</span>
          </div>
          <button onClick={() => handleAddUser(user)}>Add</button>
        </div>
      ))}
    </div>
  );
}

export default AddUser;