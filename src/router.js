import React from "react";
import { Router, Link } from "@reach/router";
import Search from "./Search";
import RNode from "./RNode";
import ChatRoom from "./ChatRoom";
import Register from "./Register";
import FriendList from "./FriendList";
import Login from "./Login";
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
