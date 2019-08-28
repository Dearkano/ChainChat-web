import React, {useState} from 'react';
import {navigate} from '@reach/router'
import logo from './astri-logo.svg';
import Router from './router'
import './App.css';
import { Layout, Menu, Breadcrumb, Icon } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function App() {
    const [collapsed, setCollapsed] = useState(false)
      const onCollapse = collapsed => {
        setCollapsed(collapsed)
      };
    
  return (
    <Layout style={{ minHeight: '100vh' }}>
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="side-logo" />
      <Menu theme="dark" defaultSelectedKeys={['3']} mode="inline">
      <Menu.Item key="3"onClick={()=>navigate('/chatroom')}>
          <Icon type="pie-chart" />
          <span>ChatRoom</span>
        </Menu.Item>
        <Menu.Item key="4"onClick={()=>navigate('/register')}>
          <Icon type="user-add" />
          <span>Register</span>
        </Menu.Item>
        <Menu.Item key="1" onClick={()=>navigate('/search')}>
          <Icon type="file" />
          <span>AFS Search</span>
        </Menu.Item>
        <Menu.Item key="2"onClick={()=>navigate('/rnode')}>
          <Icon type="pie-chart" />
          <span>AFS Info</span>
        </Menu.Item>
        </Menu>
    </Sider>
    <Layout>
      <Header style={{ background: '#fff', padding: 0 }} >
          <img src={logo} className="App-logo" alt="logo" />
      </Header>
      <Content style={{ margin: '0 16px' }}>
        <Router />
      </Content>
      <Footer style={{ textAlign: 'center' }}>NDN Project@ASTRI 2019 - Vayne Tian</Footer>
    </Layout>
  </Layout>
  );
}

export default App;
