import React from "react";
import { ChatList } from "react-chat-elements";
import { Button, Modal, Input, Form, List, Icon } from "antd";
import g from "../../state";
import { Subscribe, Provider } from "unstated";
import { navigate } from "@reach/router";
import QRCode from "qrcode";

class FriendList extends React.Component {
  state = {
    visible: false
  };
  showModal = () => {
    this.setState({
      visible: true
    });
  };
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };
  handleOk = e => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { addr, remark } = values;
        await g.addFriend({
          addr,
          remark
        });
      }
    });
    this.setState({
      visible: false
    });
  };

  async componentDidMount() {
    console.log("in");
    console.log(g.state);
    if (!g.state.userInfo) {
      navigate("/");
      return;
    }
    // get friend list
    await g.getFriendList();
    console.log(g.state.userInfo);
    const publicKey = g.state.userInfo.publicKey;
    QRCode.toCanvas(
      publicKey,
      {
        errorCorrectionLevel: "H"
      },
      function(err, canvas) {
        if (err) throw err;

        var container = document.getElementById("qrcode");
        container.appendChild(canvas);
      }
    );
  }
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <Provider>
          <Modal
            title="Add Friend"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <Form className="login-form">
              <Form.Item>
                {getFieldDecorator("addr", {
                  rules: [
                    {
                      required: true,
                      message: "Please input the address!"
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon
                        type="address"
                        style={{
                          color: "rgba(0,0,0,.25)"
                        }}
                      />
                    }
                    placeholder="Address"
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator("remark", {
                  rules: [
                    {
                      required: true,
                      message: "Please input the remark!"
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon
                        type="user"
                        style={{
                          color: "rgba(0,0,0,.25)"
                        }}
                      />
                    }
                    placeholder="Remark"
                  />
                )}
              </Form.Item>
            </Form>
          </Modal>
          <div>
            Current Login: {g.state.userInfo ? g.state.userInfo.addr : ""}
          </div>
          <Button
            onClick={this.showModal}
            className="add-friend-btn"
            icon="plus-circle"
            type="primary"
          >
            Add Friend
          </Button>
          <Subscribe to={[g]}>
            {G => {
              console.log(G.state.messageList);
              const fl = [].concat(G.state.messageList);
              fl.forEach(item => {
                item.avatar = "https://placeimg.com/140/140/any";
                item.alt = "Reactjs";
                item.title = item.remark;
                item.date = new Date();
                item.unread = item.messages.filter(
                  item => item.status === "pending"
                ).length;
              });
              return (
                <ChatList
                  key={G.state.messageList.length}
                  className="chat-list"
                  onClick={item => {
                    console.log(item);
                    navigate("/chatroom", {
                      state: {
                        addr: item.addr,
                        remark: item.remark
                      }
                    });
                  }}
                  dataSource={fl}
                />
              );
            }}
          </Subscribe>

          <div id="qrcode"> </div>
        </Provider>
      </>
    );
  }
}

export default Form.create({
  name: "friendList"
})(FriendList);
