import { useState } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Details from "./components/details/Details";
import Login from "./components/login/Login";

/* ✅ ADD THESE TWO LINES */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);

  return (
    <>
      {/* ✅ THIS IS REQUIRED */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      <div className="app-wrapper">
      <div className="container">
        {user ? (
          <>
            <List
              user={user}
              activeChatUser={activeChatUser}
              onSelectUser={setActiveChatUser}
            />

            <Chat user={user} activeChatUser={activeChatUser} />

            <Details
              user={activeChatUser}
              onLogout={() => {
                setUser(null);
                setActiveChatUser(null);
              }}
            />
          </>
        ) : (
          <Login setUser={setUser} />
        )}
      </div></div>
    </>
  );
};

export default App;