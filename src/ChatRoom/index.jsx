/* eslint-disable default-case */
import React, { Component } from "react";
import { Button, Input, Radio } from "antd";
import {
  MessageBox,
  ChatItem,
  ChatList,
  SystemMessage,
  MessageList,
  Input as InputChat,
  Avatar,
  Navbar,
  SideBar,
  Dropdown,
  Popup
} from "react-chat-elements";
import io from "socket.io-client";

import FaSearch from "react-icons/lib/fa/search";
import FaComments from "react-icons/lib/fa/comments";
import FaClose from "react-icons/lib/fa/close";
import FaMenu from "react-icons/lib/md/more-vert";
import { format } from "timeago.js";

import Identicon from "identicon.js";

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: true,
      messageList: [],
      cluster: 0,
      ws: null
    };
  }

  componentWillMount() {
    // setInterval(this.addMessage.bind(this), 3000);
  }

  onClusterChange = e => this.setState({ cluster: e.target.value });

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

  addMessage = () => {
    this.state.ws.emit(
      "chat",
      JSON.stringify({
        sender: this.refs.name.state.value,
        receiver: "no one",
        data: this.refs.input.state.value
      })
    );
    var list = this.state.messageList;
    list.push({
      position: "right",
      forwarded: true,
      type: "text",
      theme: "white",
      view: "list",
      title: this.refs.name.state.value,
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
      () => this.refs.input.clear()
    );
  };

  connect = () => {
    const host =
      this.state.cluster === 0
        ? "ws://47.75.197.211:8085"
        : "ws://139.159.244.231:8085";
    const ws = io(host);
    const that = this;

    ws.on("res", str => {
      var list = that.state.messageList;
      console.log(str)
      const data = JSON.parse(str)
      list.push({
        position: "left",
        forwarded: true,
        type: "text",
        theme: "white",
        view: "list",
        title: data.sender,
        titleColor: this.getRandomColor(),
        text: data.data,
        onLoad: () => {
          console.log("Photo loaded");
        },
        status: "read",
        date: +new Date()
      });
      that.setState({ messageList: list });
    });
    this.setState({ ws });
  };

  render() {
    var arr = [];
    var chatSource = arr.map(x => this.random("chat"));

    return (
      <>
        <Input ref="name" />
        <Radio.Group onChange={this.onClusterChange} value={this.state.cluster}>
          <Radio value={0}>ACAC</Radio>
          <Radio value={1}>AAAF</Radio>
        </Radio.Group>
        <Button type="primary" onClick={this.connect}>
          Connect
        </Button>
        <div className="container">
          {/* <div className="chat-list">
          <SideBar
            top={
              <Popup
                // show={this.state.show}
                header="Lorem ipsum dolor sit amet."
                headerButtons={[
                  {
                    type: "transparent",
                    color: "black",
                    onClick: () => {
                      this.setState({
                        show: false
                      });
                    },
                    icon: {
                      component: <FaClose />,
                      size: 18
                    }
                  }
                ]}
                text="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem animi veniam voluptas eius!"
                footerButtons={[
                  {
                    color: "white",
                    backgroundColor: "#ff5e3e",
                    text: "Vazgeç"
                  },
                  {
                    color: "white",
                    backgroundColor: "lightgreen",
                    text: "Tamam"
                  }
                ]}
              />
            }
            center={<ChatList dataSource={chatSource} />}
            bottom={
              <span>
                <Button
                  type="transparent"
                  color="black"
                  icon={{
                    component: <FaComments />,
                    size: 18
                  }}
                />{" "}
                <Button
                  type="transparent"
                  color="black"
                  icon={{
                    component: <FaSearch />,
                    size: 18
                  }}
                />{" "}
                <Button text="Count"> </Button>{" "}
              </span>
            }
          />{" "}
        </div>{" "} */}
          <div className="right-panel">
            <MessageList
              className="message-list"
              lockable={true}
              downButtonBadge={10}
              dataSource={this.state.messageList}
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
                  this.refs.input.clear();
                  this.addMessage();
                  e.preventDefault();
                  return false;
                }
              }}
              rightButtons={
                <Button type="primary" onClick={this.addMessage.bind(this)}>
                  Input
                </Button>
              }
            />{" "}
          </div>{" "}
        </div>
      </>
    );
  }
}
