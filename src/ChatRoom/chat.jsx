/* eslint-disable default-case */
import React, { Component } from "react";
import { Button, Input, List } from "antd";
import JsEncrypt from "jsencrypt";
import { MessageBox, Input as InputChat, Dropdown } from "react-chat-elements";
import io from "socket.io-client";

import FaMenu from "react-icons/lib/md/more-vert";
import InfiniteList from "../components/InfiniteList";

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
    const { username, token, privateKey, publicKey } = this.props.userInfo;
    console.log(this.props.userInfo);
    const body = new FormData();
    body.append("token", token);
    // const encrypt = new JsEncrypt();
    // encrypt.setPublicKey(this.state.receiverPublicKey);
    // const encryptedContent = encrypt.encrypt(this.refs.input.state.value);
    // body.append("message", encryptedContent);
    body.append("message", this.refs.input.state.value);
    const res = await fetch(`http://139.159.244.231:8080/msg/upload`, {
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
        sender: username,
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
      title: this.props.userInfo.username,
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
    const { username, token, privateKey, publicKey } = this.props.userInfo;
    const host = `ws://${this.props.host}`;
    const receiver = this.refs.receiver.state.value;
    const query = `?sender=${encodeURIComponent(
      username
    )}&receiver=${encodeURIComponent(receiver)}`;
    console.log(host + query);
    const ws = io(host + query);
    const that = this;
    ws.on("connect", function() {
      console.log("on connection");
      ws.emit("publicKey", JSON.stringify({ publicKey, username }));
      that.setState({ ws });
    });
    ws.on("historytest", str => console.log("history test" + str));
    ws.on("history", async str => {
      console.log("history");

      const data = JSON.parse(str);
      console.log(data);
      const list = that.state.messageList;
      for (const item of data) {
        const res = await fetch(
          `http://139.159.244.231:8080/msg/download?token=${
            this.props.userInfo.token
          }&afid=${item.afid}`
        );
        const d = await res.json();
        list.push({
          position: "left",
          forwarded: true,
          type: "text",
          theme: "white",
          view: "list",
          title: item.sender,
          titleColor: this.getRandomColor(),
          text: d.Message,
          onLoad: () => {
            console.log("Photo loaded");
          },
          status: "read",
          date: +new Date()
        });
      }
      // get receiver's publicKey
      const res1 = await fetch(
        `http://${this.props.host}/getPublicKey?username=${encodeURIComponent(
          receiver
        )}`
      );
      if (res1.status !== 200) return;
      const data1 = await res1.json();
      this.setState({
        ws,
        receiverPublicKey: data1.publicKey,
        messageList: list
      });
    });

    ws.on("res", async str => {
      const list = that.state.messageList;
      console.log(str);
      const data = JSON.parse(str);
      const afid = data.data;
      const res = await fetch(
        `http://139.159.244.231:8080/msg/download?token=${
          this.props.userInfo.token
        }&afid=${afid}`
      );
      const d = await res.json();
      const isSuccess = d.SuccStatus > 0;
      if (!isSuccess) return;
      //const encrypt = new JsEncrypt();
      //   encrypt.setPublicKey(publicKey);
      //   encrypt.setPrivateKey(privateKey);
      //   const mes = encrypt.decrypt(d.message);
      list.push({
        position: "left",
        forwarded: true,
        type: "text",
        theme: "white",
        view: "list",
        title: data.sender,
        titleColor: this.getRandomColor(),
        text: d.Message,
        onLoad: () => {
          console.log("Photo loaded");
        },
        status: "read",
        date: +new Date()
      });
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

  render() {
    var arr = [];
    var chatSource = arr.map(x => this.random("chat"));

    return (
      <>
        <Input ref="receiver" />
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
