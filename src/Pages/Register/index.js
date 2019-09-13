import { navigate } from "@reach/router";

import React from "react";
import { Form, Icon, Input, Button, Checkbox } from "antd";
import md5 from "md5";
import g from '../../state'
class Register extends React.Component {
  state = {
    email: "",
    defaultPassword: "",
    step: 0
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const body = new FormData();
        body.append("email", values.email);
        body.append("invitation_code", values.invitationCode);
        const res = await fetch(`${g.state.afsHost}/auth/signup`, {
          method: "post",
          body
        });
        if (res.status !== 200) return;
        const data = await res.json();
        if (data.SuccStatus <= 0) return;
        const defaultPassword = data.Password;

        this.setState({ step: 1, defaultPassword, email: values.email });
      }
    });
  };

  handleSubmit1 = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const timestampRes = await fetch(`${g.state.afsHost}/auth/time`);
        const timestampJson = await timestampRes.json();
        const timestamp = timestampJson.CurrentTimeStamp;
        const body = new FormData();
        const signature = md5(
          `${this.state.email}+${this.state.defaultPassword}+${timestamp}`
        );
        body.append("email", this.state.email);
        body.append("timeStamp", timestamp);
        body.append("new_password", values.password);
        body.append("signature", signature);
        const res = await fetch(`${g.state.afsHost}/auth/changepassword`, {
          method: "post",
          body
        });
        if (res.status !== 200) return;
        const data = await res.json();
        if (data.SuccStatus <= 0) return;
        navigate("/chatroom");
      }
    });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { step } = this.state;

    return (
      <>
        {step === 0 && (
          <div id="components-form-demo-normal-login">
            <Form onSubmit={this.handleSubmit} className="login-form">
              <Form.Item>
                {getFieldDecorator("email", {
                  rules: [
                    { required: true, message: "Please input your email!" }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon type="email" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="Email"
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator("invitationCode", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your Invitation Code!"
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon
                        type="user-add"
                        style={{ color: "rgba(0,0,0,.25)" }}
                      />
                    }
                    placeholder="Invitation Code"
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Register
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        {step === 1 && (
          <div id="components-form-demo-normal-login">
            <Form onSubmit={this.handleSubmit1} className="login-form">
              <Form.Item label="Password" hasFeedback>
                {getFieldDecorator("password", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your password!"
                    },
                    {
                      validator: this.validateToNextPassword
                    }
                  ]
                })(<Input.Password />)}
              </Form.Item>
              <Form.Item label="Confirm Password" hasFeedback>
                {getFieldDecorator("confirm", {
                  rules: [
                    {
                      required: true,
                      message: "Please confirm your password!"
                    },
                    {
                      validator: this.compareToFirstPassword
                    }
                  ]
                })(<Input.Password onBlur={this.handleConfirmBlur} />)}
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Confirm
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </>
    );
  }
}

const WrappedRegister = Form.create({ name: "register" })(Register);

export default WrappedRegister;
