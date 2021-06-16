import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import './Navbar.css';
import { getCurPageIdx } from "../Constants/HeaderItems";

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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[getCurPageIdx().toString()]}>
          <Menu.Item key="0" onClick={() => handlePageChange('Home', 0)}>
            Home
          </Menu.Item>
          <Menu.Item key="1" onClick={() => handlePageChange('Projects', 1)}>
            Projects
          </Menu.Item>
          <Menu.Item key="2" onClick={() => handlePageChange('Experience', 2)}>
            Experience
          </Menu.Item>
          <Menu.Item key="3" onClick={() => handlePageChange('Contact', 3)}>
            Contact
          </Menu.Item>
        </Menu>
      </Sider>
  )
}
export default Navbar
