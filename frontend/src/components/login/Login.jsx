import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";

function Login({ setUser }) {
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);

  // Avatar select
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatar({
      file,
      url: URL.createObjectURL(file),
    });
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!avatar.file) {
      toast.error("Please select a profile picture");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const sendData = new FormData();
      sendData.append("username", formData.get("username"));
      sendData.append("email", formData.get("email"));
      sendData.append("password", formData.get("password"));
      sendData.append("avatar", avatar.file);

      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        body: sendData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Registered successfully");

      setUser({
        id: data.id,
        username: data.username,
        avatar: data.avatar,
      });
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("loginUsername"),
          password: formData.get("loginPassword"),
        }),
      });

      const data = await res.json();

      // ❌ WRONG USERNAME / PASSWORD / BOTH
      if (!res.ok) {
        toast.error("Invalid username or password");
        return;
      }

      toast.success("Login successful");

      setUser({
        id: data.id,
        username: data.username,
        avatar: data.avatar,
      });
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* LOGIN */}
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="loginUsername"
            placeholder="Username"
            required
          />
          <input
            type="password"
            name="loginPassword"
            placeholder="Password"
            required
          />
          <button disabled={loading}>
            {loading ? "Please wait..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      {/* REGISTER */}
      <div className="item">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <img src={avatar.url || "/avatar.png"} alt="avatar" />

          <input type="file" id="file" hidden onChange={handleAvatar} />
          <label htmlFor="file">Upload Image</label>

          <input type="text" name="username" placeholder="Username" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />

          <button disabled={loading}>
            {loading ? "Please wait..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;