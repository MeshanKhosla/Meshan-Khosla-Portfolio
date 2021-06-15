import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import './Navbar.css';

const { Sider } = Layout;
const Navbar = ({ handlePageChange }) => {
  return (
      <Sider
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
      >
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
          <Menu.Item key="1" onClick={() => handlePageChange('home', 0)}>
            Home
          </Menu.Item>
          <Menu.Item key="2" onClick={() => handlePageChange('projects', 1)}>
            Projects
          </Menu.Item>
          <Menu.Item key="3" onClick={() => handlePageChange('experience', 2)}>
            Experience
          </Menu.Item>
          <Menu.Item key="4" onClick={() => handlePageChange('contact', 3)}>
            Contact
          </Menu.Item>
        </Menu>
      </Sider>
  )
}
export default Navbar
