
import "./user.css";

function UserInfo({ user }) {
  return (
    <div className="userinfo">
      <div className="user">
        <img
          src={user?.avatar || "/avatar.png"}
          alt="profile"
        />
        <h2>{user?.username || "User"}</h2>
      </div>

      <div className="icon">
        <img src="/more.png" alt="" />
        <img src="/video.png" alt="" />
        <img src="/edit.png" alt="" />
      </div>
    </div>
  );
}

export default UserInfo;
