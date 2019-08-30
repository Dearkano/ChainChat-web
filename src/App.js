import React, { useState } from "react";
import { navigate } from "@reach/router";
import logo from "./astri-logo.svg";
import Router from "./router";
import "./App.css";
import { Layout, Menu, Breadcrumb, Icon } from "antd";
import { Provider, Subscribe, Container } from "unstated";
import g from "./state";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  return (
    <Provider>
      <Subscribe to={[g]}>
        {G => {
          console.log(G.state.userInfo);
          return (
            <Layout style={{ minHeight: "100vh" }}>
              <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
                <div className="side-logo" />
                <Menu
                  theme="dark"
                  defaultSelectedKeys={["1"]}
                  selectedKeys={G.state.selectedKeys}
                  mode="inline"
                >
                  {!G.state.userInfo && (
                    <Menu.Item
                      key="1"
                      onClick={() => {
                        navigate("/login");
                        G.setKeys("1");
                      }}
                    >
                      <Icon type="login" />
                      <span>Login</span>
                    </Menu.Item>
                  )}
                  {G.state.userInfo && (
                    <Menu.Item
                      key="2"
                      onClick={() => {
                        navigate("/friendlist");
                        G.setKeys("2");
                      }}
                    >
                      <Icon type="team" />
                      <span>FriendList</span>
                    </Menu.Item>
                  )}
                  {G.state.userInfo && (
                    <Menu.Item
                      key="3"
                      onClick={() => {
                        navigate("/chatroom");
                        G.setKeys("3");
                      }}
                    >
                      <Icon type="logout" />
                      <span>Logout</span>
                    </Menu.Item>
                  )}
                  <Menu.Item
                    key="5"
                    onClick={() => {
                      navigate("/search");
                      G.setKeys("5");
                    }}
                  >
                    <Icon type="file" />
                    <span>AFS Search</span>
                  </Menu.Item>
                  <Menu.Item
                    key="6"
                    onClick={() => {
                      navigate("/rnode");
                      G.setKeys("6");
                    }}
                  >
                    <Icon type="pie-chart" />
                    <span>AFS Info</span>
                  </Menu.Item>
                </Menu>
              </Sider>
              <Layout>
                <Header style={{ background: "#fff", padding: 0 }}>
                  <img src={logo} className="App-logo" alt="logo" />
                </Header>
                <Content style={{ margin: "0 16px" }}>
                  <Router />
                </Content>
                <Footer style={{ textAlign: "center" }}>
                  NDN Project@ASTRI 2019 - Vayne Tian
                </Footer>
              </Layout>
            </Layout>
          );
        }}
      </Subscribe>
    </Provider>
  );
}

export default App;
