/* eslint-disable default-case */
import React, { Component } from "react";
import { Button, Input, List, Icon, Upload, message } from "antd";
import JsEncrypt from "jsencrypt";
import {
  MessageBox,
  Input as InputChat,
  Dropdown,
  SystemMessage
} from "react-chat-elements";
import io from "socket.io-client";

import FaMenu from "react-icons/lib/md/more-vert";
import { navigate } from "@reach/router";
import { Generate_key } from "../../utils";
import g from "../../state";
const config = require('../../config.json')
const CryptoJS = require("crypto-js");

const host1 = config.bos;

const convertFile = async file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
  });
};

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: true,
      messageList: [],
      cluster: 0,
      ws: null,
      receiverPublicKey: "",
      AESKEY: "",
      encryptedAESKEY: ""
    };
  }

  async componentWillUnmount() {
    // setInterval(this.addMessage.bind(this), 3000);
    if (this.state.ws) this.state.ws.close();
    await g.getFriendList();
  }

  getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  token() {
    return parseInt((Math.random() * 10) % 6);
  }

  random = type => {
    switch (type) {
      case "message":
        var type = 5;
        var status = "waiting";
        switch (type) {
          case 0:
            type = "photo";
            status = "sent";
            break;
          case 1:
            type = "file";
            status = "sent";
            break;
          case 2:
            type = "system";
            status = "received";
            break;
          case 3:
            type = "location";
            break;
          case 4:
            type = "spotify";
            break;
          default:
            type = "text";
            status = "read";
            break;
        }
        console.log(this.refs.input);

        return {
          position: this.token() >= 1 ? "right" : "left",
          forwarded: true,
          type: type,
          theme: "white",
          view: "list",
          title: "this is a title",
          titleColor: this.getRandomColor(),
          text: this.refs.input.state.value,
          onLoad: () => {
            console.log("Photo loaded");
          },
          status: status,
          date: +new Date()
        };
      case "chat":
        return {
          id: String(Math.random()),
          avatarFlexible: true,
          statusColor: "lightgreen",
          alt: "ewg",
          title: "ewg",
          date: new Date(),
          subtitle: "eg",
          unread: parseInt((Math.random() * 10) % 3),
          dropdownMenu: (
            <Dropdown
              animationPosition="norteast"
              buttonProps={{
                type: "transparent",
                color: "#cecece",
                icon: {
                  component: <FaMenu />,
                  size: 24
                }
              }}
              items={["Menu Item1", "Menu Item2", "Menu Item3"]}
            />
          )
        };
    }
  };

  addMessage = async () => {
    // send message to get afid
    const {
      username,
      addr,
      token,
      privateKey,
      publicKey
    } = this.props.userInfo;
    console.log(this.props.userInfo);
    const body = new FormData();
    body.append("token", token);
    const cipher = CryptoJS.AES.encrypt(
      this.refs.input.state.value,
      this.state.AESKEY
    ).toString();
    const content = JSON.stringify({
      ph: this.state.encryptedAESKEY,
      cipher
    });
    body.append("message", content);
    // body.append("message", this.refs.input.state.value);
    const res = await fetch(`${host1}/msg/upload`, {
      method: "post",
      body
    });
    const data = await res.json();
    const isSuccess = data.SuccStatus > 0;
    if (!isSuccess) return;
    const afid = data.Afid;
    this.state.ws.emit(
      "chat",
      JSON.stringify({
        sender: addr,
        receiver: this.props.receiver,
        data: afid
      })
    );
    var list = this.state.messageList;
    console.log(this.refs.input);
    list.push({
      position: "right",
      forwarded: true,
      type: "text",
      theme: "white",
      view: "list",
      title: this.props.userInfo.addr,
      titleColor: this.getRandomColor(),
      text: this.refs.input.state.value,
      onLoad: () => {
        console.log("Photo loaded");
      },
      status: "read",
      date: +new Date()
    });
    this.setState(
      {
        messageList: list
      },
      () => {
        this.refs.input.clear();
        const ele = document.getElementById("chat-list");
        ele.scrollTop = ele.scrollHeight;
      }
    );
  };

  connect = async () => {
    const {
      username,
      token,
      privateKey,
      publicKey,
      addr,
      publicKeyAfid
    } = this.props.userInfo;
    const wshost = `ws://${this.props.host}`;
    const receiver = this.props.receiver;
    const query = `?sender=${encodeURIComponent(
      addr
    )}&receiver=${encodeURIComponent(receiver)}`;
    console.log(wshost + query);
    const ws = io(wshost + query);
    const that = this;
    ws.on("connect", async function() {
      console.log("on connection");
      that.setState({ ws });
    });
    ws.on("historytest", str => console.log("history test" + str));
    ws.on("history", async str => {
      console.log("history");
      const data = JSON.parse(str);
      console.log(data);
      const list = that.state.messageList;
      for (const item of data) {
        if (item.type === "afid") {
          const res = await fetch(
            `${host1}/msg/download?token=${token}&afid=${item.afid}`
          );
          const d = await res.json();
          const obj = JSON.parse(d.Message);
          let encrypt = new JsEncrypt();
          encrypt.setPrivateKey(privateKey);
          const ph = encrypt.decrypt(obj.ph) || this.state.AESKEY;
          const mes = CryptoJS.AES.decrypt(obj.cipher, ph).toString(
            CryptoJS.enc.Utf8
          );
          list.push({
            position: item.sender === addr ? "right" : "left",
            forwarded: true,
            type: "text",
            theme: "white",
            view: "list",
            title: item.sender,
            titleColor: this.getRandomColor(),
            text: mes,
            onLoad: () => {
              console.log("Photo loaded");
            },
            status: "read",
            date: item.timestamp
          });
          this.setState({
            ws,
            messageList: list
          });
        } else if (item.type === "image") {
            const res = await fetch(
                `${host1}/file/download?token=${token}&afid=${item.afid}`
              );
              const data = await res.blob();
              console.log(data);
              const base64 = await convertFile(data);
              console.log("=-=");
              console.log(base64);
              list.push({
                position: item.sender===addr? "right":"left",
                forwarded: true,
                type: "photo",
                theme: "white",
                view: "list",
                title: data.sender,
                titleColor: this.getRandomColor(),
                data: {
                  uri: base64,
                  width: 300,
                  height: 300
                },
                onLoad: () => {
                  console.log("Photo loaded");
                },
                status: "read",
                date: item.timestamp
              });
              this.setState({
                ws,
                messageList: list
              });
        }
      }
    });

    ws.on("res", async str => {
      const list = that.state.messageList;
      console.log(str);
      const data = JSON.parse(str);
      const type = data.type;
      const afid = data.data;

      if (type === "afid") {
        const res = await fetch(
          `${host1}/msg/download?token=${token}&afid=${afid}`
        );
        const d = await res.json();
        const isSuccess = d.SuccStatus > 0;
        if (!isSuccess) return;
        const obj = JSON.parse(d.Message);
        console.log(obj);
        let encrypt = new JsEncrypt();
        encrypt.setPrivateKey(privateKey);
        const ph = encrypt.decrypt(obj.ph);
        const mes = CryptoJS.AES.decrypt(obj.cipher, ph).toString(
          CryptoJS.enc.Utf8
        );
        list.push({
          position: "left",
          forwarded: true,
          type: "text",
          theme: "white",
          view: "list",
          title: data.sender,
          titleColor: this.getRandomColor(),
          text: mes,
          onLoad: () => {
            console.log("Photo loaded");
          },
          status: "read",
          date: +new Date()
        });
      } else if (type === "image") {
        const res = await fetch(
          `${host1}/file/download?token=${token}&afid=${afid}`
        );
        const data = await res.blob();
        console.log(data);
        const base64 = await convertFile(data);
        console.log("=-=");
        console.log(base64);
        list.push({
          position: "left",
          forwarded: true,
          type: "photo",
          theme: "white",
          view: "list",
          title: data.sender,
          titleColor: this.getRandomColor(),
          data: {
            uri: base64,
            width: 300,
            height: 300
          },
          onLoad: () => {
            console.log("Photo loaded");
          },
          status: "read",
          date: +new Date()
        });
      }

      that.setState({ messageList: list }, () => {
        const ele = document.getElementById("chat-list");
        ele.scrollTop = ele.scrollHeight;
      });
    });
  };

  disconnect = () => {
    this.state.ws.disconnect();
    this.setState({ ws: null });
  };
  onImageChange = info => {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  onFileChange = info => {
    console.log(info);
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  beforeFileUpload = file => {
    this.uploadFile(file);
    return false;
  };

  beforeImageUpload = file => {
    this.uploadImage(file);
    return false;
  };

  uploadFile = async file => {};

  uploadImage = async file => {
    console.log(file);
    const {
      username,
      token,
      privateKey,
      publicKey,
      addr
    } = this.props.userInfo;
    const body = new FormData();
    body.append("token", token);
    body.append("file", file);
    const res = await fetch(`${host1}/file/upload`, { method: "post", body });
    const data = await res.json();
    if (data.SuccStatus <= 0) return;
    console.log(data);
    const afid = data.Afid;

    this.state.ws.emit(
      "image",
      JSON.stringify({
        sender: addr,
        receiver: this.props.receiver,
        data: afid
      })
    );
    var list = this.state.messageList;

    const base64 = await convertFile(file);
    console.log(base64);
    list.push({
      position: "right",
      forwarded: true,
      type: "photo",
      theme: "white",
      view: "list",
      title: this.props.userInfo.addr,
      titleColor: this.getRandomColor(),
      onLoad: () => {
        console.log("Photo loaded");
      },
      status: "read",
      data: {
        uri: base64,
        width: 300,
        height: 300
      },
      date: +new Date()
    });
    this.setState({
      messageList: list
    });
  };

  async componentDidMount() {
    if (!this.props.userInfo) {
      navigate("/");
      return;
    }
    const {
      username,
      token,
      privateKey,
      publicKey,
      addr,
      publicKeyAfid
    } = this.props.userInfo;
    const host = `http://${this.props.host}`;
    const receiver = this.props.receiver;
    // get receiver's publicKey afid
    const res1 = await fetch(
      `${host}/getPublicKey?username=${encodeURIComponent(receiver)}`
    );
    if (res1.status !== 200) return;
    const data1 = await res1.json();
    const pkAfid = data1.publicKey;

    // get receiver's publicKey
    const resp = await fetch(
      `${host1}/msg/download?token=${token}&afid=${pkAfid}`
    );
    const d = await resp.json();
    const receiverPublicKey = d.Message;
    // ws.emit("publicKey", JSON.stringify({ publicKey: publicKeyAfid, username: addr }));
    let AESKEY = "";
    const tag = `${addr}-${receiver}`;
    let res = await fetch(
      `${host1}/afid/getbytag?token=${token}&tag=ChainChat::AESKEY-${tag}`
    );
    let data = await res.json();
    // if (data.SuccStatus <= 0) return;
    // if the AES Key not exists
    if (!data.Afids || data.Afids.length === 0) {
      AESKEY = Generate_key();
      const encrypt = new JsEncrypt();
      encrypt.setPublicKey(publicKey);
      const encryptedContent = encrypt.encrypt(AESKEY);
      let body = new FormData();
      body.append("token", token);
      body.append("message", encryptedContent);
      res = await fetch(`${host1}/msg/upload`, {
        method: "post",
        body
      });
      data = await res.json();
      if (data.SuccStatus <= 0) return;
      const AESKEYAfid = data.Afid;
      body = new FormData();
      body.append("token", token);
      body.append("afid", AESKEYAfid);
      res = await fetch(`${host1}/afid/add`, {
        method: "post",
        body
      });
      data = await res.json();
      if (data.SuccStatus <= 0) return;
      // add tag
      body = new FormData();
      body.append("token", token);
      body.append("tag", `ChainChat::AESKEY-${tag}`);
      body.append("afid", AESKEYAfid);
      res = await fetch(`${host1}/afid/addtag`, {
        method: "post",
        body
      });
      data = await res.json();
      if (data.SuccStatus <= 0) return;
    } else {
      const afid = data.Afids[0].Afid;
      res = await fetch(`${host1}/msg/download?afid=${afid}&token=${token}`);
      data = await res.json();
      if (data.SuccStatus <= 0) return;
      let encrypt = new JsEncrypt();
      encrypt.setPrivateKey(privateKey);
      AESKEY = encrypt.decrypt(data.Message);
      console.log("--");
      console.log(privateKey);
      console.log(AESKEY);
    }

    const encrypt = new JsEncrypt();
    encrypt.setPublicKey(receiverPublicKey);
    const encryptedAESKEY = encrypt.encrypt(AESKEY);
    this.setState({ receiverPublicKey, AESKEY, encryptedAESKEY });
    await this.connect();
  }

  render() {
    return (
      <>
        <div>
          From: {this.props.userInfo ? `${this.props.userInfo.addr}` : ""}
        </div>
        <div>
          To: {this.props.receiver}({this.props.remark})
        </div>
        <div style={{}}>
          Status: {this.state.ws ? "Connected" : "Disconnected"}
        </div>

        <div className="container">
          <List
            id="chat-list"
            className="chat-body"
            itemLayout="vertical"
            dataSource={this.state.messageList}
            renderItem={item => (
              <List.Item>
                <MessageBox {...item} />
              </List.Item>
            )}
          />

          <div className="chat-actions">
            <Upload
              name="file"
              onChange={this.onImageChange}
              beforeUpload={this.beforeImageUpload}
            >
              <Button>
                <Icon
                  type="picture"
                  style={{ fontSize: "16px", color: "#08c" }}
                />
              </Button>
            </Upload>
            <Upload
              onChange={this.onFileChange}
              beforeUpload={this.beforeFileUpload}
              showUploadList={false}
            >
              <Button>
                <Icon type="file" style={{ fontSize: "16px", color: "#08c" }} />
              </Button>
            </Upload>
          </div>
          <InputChat
            className="chat-input"
            placeholder="Input something"
            defaultValue=""
            ref="input"
            multiline={true}
            // buttonsFloat='left'
            onKeyPress={e => {
              if (e.shiftKey && e.charCode === 13) {
                return true;
              }
              if (e.charCode === 13) {
                this.addMessage();
                e.preventDefault();
                return false;
              }
            }}
            rightButtons={
              <Button
                disabled={!Boolean(this.state.ws)}
                type="primary"
                onClick={this.addMessage.bind(this)}
              >
                Send
              </Button>
            }
          />
        </div>
      </>
    );
  }
}
