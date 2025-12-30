import { useEffect, useState } from "react";
import "./adduser.css";
import { API_BASE } from "@/config";

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
          `${API_BASE}/api/users/search/?q=&current_user_id=${currentUser.id}`
        );
        if (!res.ok) return;

        const data = await res.json();

        const withStatus = data.map((u) => ({
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

  // 🔍 SEARCH
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/users/search/?q=${username}&current_user_id=${currentUser.id}`
      );
      if (!res.ok) return;

      const data = await res.json();

      const withStatus = data.map((u) => ({
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

  // ➕ ADD USER (FIXED ENDPOINT)
  const handleAddUser = async (targetUser) => {
    if (!currentUser?.id) return;

    try {
      const res = await fetch(`${API_BASE}/api/chats/add/`, {
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
