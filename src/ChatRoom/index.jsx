import React, { useState } from "react";
import Chat from "./chat";
import Login from "./login";
import { Radio } from "antd";
export default () => {
  const [userInfo, setUserInfo] = useState(null);
  const [cluster, setCluster] = useState(0);
  const [host, setHost] = useState("47.75.197.211:8085");
  const callback = e => setUserInfo(e);
  if (!userInfo) {
    return (
      <div id="components-form-demo-normal-login">
        <Login callback={callback} />
      </div>
    );
  }
  const onClusterChange = e => {
    setCluster(e.target.value);
    switch (e.target.value) {
      // ACAC
      case 0:
        setHost("47.75.197.211:8085");
        break;
      case 1:
        setHost("139.159.244.231:8085");
        break;
      default:
    }
  };
  return (
    <>
      <Radio.Group onChange={onClusterChange} value={cluster}>
        <Radio value={0}>ACAC</Radio>
        <Radio value={1}>AAAF</Radio>
      </Radio.Group>
      <Chat userInfo={userInfo} host={host} />
    </>
  );
};
