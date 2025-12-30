import ChatList from "./chatlist/ChatList";
import UserInfo from "./userInfo/UserInfo";
import "./list.css";

function List({ user, onSelectUser, activeChatUser }) {
  return (
    <div className="list">
      <UserInfo user={user} />
      <ChatList
        user={user}
        activeChatUser={activeChatUser}
        onSelectUser={onSelectUser}
      />
    </div>
  );
}

export default List;
