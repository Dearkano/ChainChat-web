import React, { useState } from "react";
import { Input, Alert, Spin, Descriptions, Button } from "antd";
import { getFileInfo, getDownloadInfo } from "../../utils";

const { Search } = Input;

export default () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState(null);
  const searchAfid = async v => {
    if (!v) {
      alert("Please input the afid");
    } else {
      setLoading(true);
      const res = await getFileInfo(v);
      console.log(res);
      setData(res);
      setLoading(false);
      if (res) {
        setShow(false);
      } else {
        setShow(true);
      }
    }
  };

  const handleDownloadInfo = async () => {
    if (!data) return;
    const tmp = await getDownloadInfo(data.afid);
    if (!tmp) {
      alert("please download first");
      return;
    }
    setInfo(tmp);
  };
  return (
    <>
      {" "}
      <div className="search-bar">
        <Search
          style={{
            width: "500px"
          }}
          placeholder="input afid"
          onSearch={value => searchAfid(value)}
          enterButton
        />
      </div>{" "}
      <div className="column">
        {" "}
        {loading && <Spin size="large" />}{" "}
        {data && !loading && (
          <div className="afid-info">
            <Descriptions title="File Info" layout="vertical" bordered>
              <Descriptions.Item label="afid"> {data.afid} </Descriptions.Item>{" "}
              <Descriptions.Item label="rs"> {data.rs} </Descriptions.Item>{" "}
              <Descriptions.Item label="download">
                {" "}
                <Button type="primary">
                  {" "}
                  <a
                    href={`http://39.100.9.55:8035/download?afid=${data.afid}`}
                    download
                  >
                    {" "}
                    Download{" "}
                  </a>
                </Button>{" "}
              </Descriptions.Item>{" "}
              <Descriptions.Item label="download info">
                {" "}
                <Button type="primary" onClick={() => handleDownloadInfo()}>
                  {" "}
                  Info{" "}
                </Button>
              </Descriptions.Item>{" "}
              {info && (
                <Descriptions.Item label="pre time">
                  {" "}
                  {info.preTime}
                  ms{" "}
                </Descriptions.Item>
              )}{" "}
              {info && (
                <Descriptions.Item label="interest time">
                  {" "}
                  {info.interestTime}
                  ms{" "}
                </Descriptions.Item>
              )}{" "}
              <Descriptions.Item label="server_dir">
                {" "}
                {data.server_dir}{" "}
              </Descriptions.Item>{" "}
              <Descriptions.Item label="is_cache">
                {" "}
                {data.is_cache}{" "}
              </Descriptions.Item>{" "}
              <Descriptions.Item label="is_cache_dat">
                {" "}
                {data.is_cache_dat}{" "}
              </Descriptions.Item>{" "}
              <Descriptions.Item label="is_cache_m">
                {" "}
                {data.is_cache_m}{" "}
              </Descriptions.Item>{" "}
              <Descriptions.Item label="is_cache_m_x">
                {" "}
                {data.is_cache_m_x}{" "}
              </Descriptions.Item>{" "}
            </Descriptions>{" "}
          </div>
        )}{" "}
        {show && (
          <Alert message="No file matches this afid" type="info">
            {" "}
          </Alert>
        )}{" "}
      </div>{" "}
    </>
  );
};
