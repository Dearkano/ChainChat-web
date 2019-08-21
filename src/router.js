import React from "react";
import { Router, Link } from "@reach/router";
import Home from './Home'
import RNode from './RNode'
import ChatRoom from './ChatRoom'

export default () => (
    <div>
      <Router>
        <Home path="/" />
        <RNode path="rnode" />
        <ChatRoom path="chatroom" />
      </Router>
    </div>
  );