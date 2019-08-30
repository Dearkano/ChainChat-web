import React from "react";
import { Form, Icon, Input, Button, Checkbox } from "antd";
import md5 from "md5";
import { navigate } from "@reach/router";
import sha256 from "sha256";
import bs58 from "bs58";
import { Subscribe } from "unstated";
import g from "../state";

const host = "http://183.178.144.228:8100";

class NormalLoginForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const timestampRes = await fetch(`${host}/auth/time`);
        const timestampJson = await timestampRes.json();
        const timestamp = timestampJson.CurrentTimeStamp;
        const signature = md5(
          `${values.username}+${values.password}+${timestamp}`
        );
        const formData = new FormData();
        formData.append("email", values.username);
        formData.append("is_expire", 1);
        formData.append("timeStamp", timestamp);
        formData.append("signature", signature);
        const res = await fetch(`${host}/auth/signin`, {
          method: "post",
          body: formData
        });
        const data = await res.json();
        const isSuccess = data.SuccStatus > 0;
        if (!isSuccess) return;
        const token = data.Token;
        const expiredTime = data.ExpireAt;

        // check if keypair exists
        const res3 = await fetch(`${host}/v2/keypair/getall?token=${token}`);
        const data3 = await res3.json();
        const isSuccess3 = data3.SuccStatus > 0;
        if (!isSuccess3) return;
        const keyPairs = data3.KeyPairs;
        let kpAddr = "";
        if (!keyPairs) {
          // create keypair
          const body = new FormData();
          body.append("token", token);
          body.append("key_type", "rsa");
          const res1 = await fetch(`${host}/v2/keypair/create`, {
            method: "post",
            body
          });
          const data1 = await res1.json();
          const isSuccess1 = data1.SuccStatus > 0;
          if (!isSuccess1) return;
          kpAddr = data1.KeyPairAddress;
        } else {
          kpAddr = keyPairs[0].KeyPairAddress;
        }

        const res2 = await fetch(
          `${host}/v2/keypair/get?token=${token}&key_pair_address=${kpAddr}`
        );
        const data2 = await res2.json();
        const isSuccess2 = data2.SuccStatus > 0;
        if (!isSuccess2) return;
        // const publicKey = data2.PublicKey;
        // const privateKey = data2.PrivateKey;
        const privateKey = data2.PublicKey;
        const publicKey = data2.PrivateKey;
        const hash = sha256.x2(publicKey);
        const addr = bs58.encode(Buffer.from(hash, "hex"));
        g.login({
          username: values.username,
          token,
          expiredTime,
          publicKey,
          privateKey,
          addr
        });
        navigate('/friendlist')
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item>
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "Please input your username!" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Username"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please input your Password!" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("remember", {
            valuePropName: "checked",
            initialValue: true
          })(<Checkbox>Remember me</Checkbox>)}
          <a className="login-form-forgot" href="">
            Forgot password
          </a>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          Or <a onClick={() => navigate("/register")}>register now!</a>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: "normal_login" })(
  NormalLoginForm
);

export default WrappedNormalLoginForm;
