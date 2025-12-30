import React from "react";
import "./details.css";

function Details({ user, onLogout }) {

  // ✅ RESET DETAILS WHEN NO USER SELECTED
  if (!user) {
    return (
      <div className="detail">
        <div className="user">
          <img src="/avatar.png" alt="profile" />
          <h2>Select a user</h2>
          <p>No chat selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail">
      {/* USER INFO */}
      <div className="user">
        <img
          src={user?.avatar || "/avatar.png"}
          alt="profile"
        />
        <h2>{user?.username || "User"}</h2>
        <p>Lorem ipsum, dolor sit amet</p>
      </div>

      {/* INFO SECTION */}
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Setting</span>
            <img src="/arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="/arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="/arrowDown.png" alt="" />
          </div>

          <div className="photos">
            {[1, 2, 3, 4].map((i) => (
              <div className="photoItem" key={i}>
                <div className="photoDetail">
                  <img
                    src="https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg"
                    alt=""
                  />
                  <span>photo_2024.png</span>
                </div>
                <img src="/download.png" alt="" className="icon" />
              </div>
            ))}
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="/arrowUp.png" alt="" />
          </div>
        </div>

        <button className="btn">Block User</button>
        <button className="logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Details;