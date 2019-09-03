import React, { useState, useEffect } from "react";
import { Tabs, Spin } from "antd";
import { getRNodeInfo } from "../../utils";
const { TabPane } = Tabs;

export default () => {
  const [key, setKey] = useState("0");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");
  useEffect(() => {
    getDefaultInfo();
  }, []);
  const getDefaultInfo = async function() {
    setLoading(true);
    const html = await getRNodeInfo("http://10.6.71.75/9240");
    document.getElementById("rnode").innerHTML = html;
    setLoading(false);
  };
  const callback = async k => {
    setLoading(true);
    let ip = "";
    switch (k) {
      case "0":
        ip = "http://10.6.71.75/9240";
        break;
      case "1":
        ip = "http://10.6.71.79/9241/index.php?_m=main.php&yyyymmdd=20190731";
        break;
      case "2":
        ip = "http://10.6.71.103/9242/";
        break;
      case "3":
        ip = "http://10.6.71.113/9243/index.php?_m=main.php&yyyymmdd=20190803";
        break;
      default:
    }
    const html = await getRNodeInfo(ip);
    setKey(k);
    document.getElementById("rnode").innerHTML = html;
    setLoading(false);
  };
  return (
    <>
      <Tabs onChange={callback} type="card">
        <TabPane tab="9240" key="0" />
        <TabPane tab="9241" key="1" />
        <TabPane tab="9242" key="2" />
        <TabPane tab="9243" key="3" />
      </Tabs>
      {loading && <Spin size="large" />}
      <div id="rnode" style={{ width: "1000px", maxHeight: "500px" }} />
    </>
  );
};
