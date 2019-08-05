import React from "react";
import { Router, Link } from "@reach/router";
import Home from './Home'
import RNode from './RNode'

export default () => (
    <div>
      <Router>
        <Home path="/" />
        <RNode path="rnode" />
      </Router>
    </div>
  );