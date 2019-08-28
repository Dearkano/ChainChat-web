import React from "react";
import { Router, Link } from "@reach/router";
import Search from './Search'
import RNode from './RNode'
import ChatRoom from './ChatRoom'
import Register from './Register'

export default () => (
    <div>
      <Router>
        <Search path="/search" />
        <RNode path="rnode" />
        <ChatRoom path="/" />
        <ChatRoom path="/chatroom" />
        <Register path="/register" />
      </Router>
    </div>
  );