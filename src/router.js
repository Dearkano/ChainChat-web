import React from "react";
import { Router, Link } from "@reach/router";
import Search from "./Pages/Search";
import RNode from "./Pages/RNode";
import ChatRoom from "./Pages/ChatRoom";
import Register from "./Pages/Register";
import FriendList from "./Pages/FriendList";
import Login from "./Pages/Login";
export default () => (
  <div>
    <Router>
      <Login path="/" />
      <Search path="/search" />
      <RNode path="/rnode" />
      <Login path="/login" />
      <ChatRoom path="/chatroom" />
      <Register path="/register" />
      <FriendList path="/friendlist" />
    </Router>
  </div>
);
