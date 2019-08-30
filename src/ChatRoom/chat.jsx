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
import InfiniteList from "../components/InfiniteList";
import QRCode from "qrcode";

const host1 = "http://183.178.144.228:8100";

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
      receiverPublicKey: ""
    };
  }

  componentWillMount() {
    // setInterval(this.addMessage.bind(this), 3000);
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
    const encrypt = new JsEncrypt();
    encrypt.setPublicKey(this.state.receiverPublicKey);
    const encryptedContent = encrypt.encrypt(this.refs.input.state.value);
    body.append("message", encryptedContent);
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
        receiver: this.refs.receiver.state.value,
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
      addr
    } = this.props.userInfo;
    const host = `http://${this.props.host}`;
    const body = new FormData();
    body.append("token", token);
    // const encrypt = new JsEncrypt();
    // encrypt.setPublicKey(this.state.receiverPublicKey);
    // const encryptedContent = encrypt.encrypt(this.refs.input.state.value);
    // body.append("message", encryptedContent);
    body.append("message", publicKey);
    const res = await fetch(`${host1}/msg/upload`, {
      method: "post",
      body
    });
    const data = await res.json();
    const isSuccess = data.SuccStatus > 0;
    if (!isSuccess) return;
    const afid = data.Afid;
    const wshost = `ws://${this.props.host}`;
    const receiver = this.refs.receiver.state.value;
    const query = `?sender=${encodeURIComponent(
      addr
    )}&receiver=${encodeURIComponent(receiver)}`;
    console.log(wshost + query);
    const ws = io(wshost + query);
    const that = this;
    ws.on("connect", async function() {
      console.log("on connection");
      ws.emit("publicKey", JSON.stringify({ publicKey: afid, username: addr }));
      // get receiver's publicKey
      const res1 = await fetch(
        `${host}/getPublicKey?username=${encodeURIComponent(receiver)}`
      );
      if (res1.status !== 200) return;
      const data1 = await res1.json();
      const pkAfid = data1.publicKey;
      const resp = await fetch(
        `${host1}/msg/download?token=${token}&afid=${pkAfid}`
      );
      const d = await resp.json();
      const receiverPublicKey = d.Message;
      that.setState({ ws, receiverPublicKey });
    });
    ws.on("historytest", str => console.log("history test" + str));
    ws.on("history", async str => {
      console.log("history");
      const data = JSON.parse(str);
      console.log(data);
      const list = that.state.messageList;
      for (const item of data) {
        const res = await fetch(
          `${host1}/msg/download?token=${token}&afid=${item.afid}`
        );
        const d = await res.json();
        const encrypt = new JsEncrypt();
        encrypt.setPublicKey(publicKey);
        encrypt.setPrivateKey(privateKey);
        const mes = encrypt.decrypt(d.Message);
        list.push({
          position: "left",
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
          date: +new Date()
        });
        this.setState({
          ws,
          messageList: list
        });
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
        const encrypt = new JsEncrypt();
        encrypt.setPublicKey(publicKey);
        encrypt.setPrivateKey(privateKey);
        const mes = encrypt.decrypt(d.Message);
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
            uri: base64
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
        receiver: this.refs.receiver.state.value,
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
        uri: base64
      },
      date: +new Date()
    });
    this.setState({
      messageList: list
    });
  };

  componentDidMount() {
    const {
      username,
      token,
      privateKey,
      publicKey,
      addr
    } = this.props.userInfo;
    QRCode.toCanvas(publicKey, { errorCorrectionLevel: "H" }, function(
      err,
      canvas
    ) {
      if (err) throw err;

      var container = document.getElementById("qrcode");
      container.appendChild(canvas);
    });
  }

  render() {
    var arr = [];
    var chatSource = arr.map(x => this.random("chat"));

    return (
      <>
        <Input ref="receiver" style={{ marginBottom: "20px" }} />
        <Button type="primary" onClick={this.connect}>
          Connect
        </Button>
        <Button
          type="primary"
          style={{ marginLeft: "20px" }}
          onClick={this.disconnect}
        >
          Disconnect
        </Button>
        <div>Current Login: {this.props.userInfo.addr} </div>
        <div style={{}}>
          Status: {this.state.ws ? "Connected" : "Disconnected"}
        </div>
        <div id="qrcode"></div>
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
              <Button type="primary" onClick={this.addMessage.bind(this)}>
                Send
              </Button>
            }
          />
        </div>
      </>
    );
  }
}
