import { useCallback } from "react";
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import './Navbar.css';
import { PATH_TO_INDEX } from "../Constants/HeaderItems";
import { useHistory, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Navbar = ({ isNavCollapsed }) => {
  const history = useHistory();
  const location = useLocation();

  const handlePageChange = useCallback(page => {
    history.push(`/${page}`)
  }, []);

  return (
      <Sider
        className='side-navbar'
        collapsed={isNavCollapsed}
      >
        <Menu theme="dark" mode="inline" defaultSelectedKeys={PATH_TO_INDEX[location.pathname]}>
          <Menu.Item key="0" onClick={() => handlePageChange('')}>
            Home
          </Menu.Item>
          <Menu.Item key="1" onClick={() => handlePageChange('projects')}>
            Projects
          </Menu.Item>
          <Menu.Item key="2" onClick={() => handlePageChange('experience')}>
            Experience
          </Menu.Item>
          <Menu.Item key="3" onClick={() => handlePageChange('contact' )}>
            Contact
          </Menu.Item>
        </Menu>
      </Sider>
  )
}
export default Navbar
