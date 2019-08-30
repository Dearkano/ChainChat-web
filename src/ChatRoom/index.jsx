import React, { useState } from "react";
import Chat from "./chat";
import { Radio } from "antd";
import { Subscribe } from "unstated";
import g from "../state";
export default () => {
  const [cluster, setCluster] = useState(0);
  const [host, setHost] = useState("47.75.197.211:8085");
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
      <Subscribe to={[g]}>
        {G => {
          return (
            <>
              <Radio.Group onChange={onClusterChange} value={cluster}>
                <Radio value={0}>ACAC</Radio>
                <Radio value={1}>AAAF</Radio>
              </Radio.Group>
              <Chat userInfo={G.state.userInfo} host={host} />
            </>
          );
        }}
      </Subscribe>
    </>
  );
};
