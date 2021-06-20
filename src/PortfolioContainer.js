import { useEffect, useState } from "react";
import './App.css';
import Navbar from './Navbar/Navbar';
import { Layout } from 'antd';
import Header from "./Header/Header";
import {PATH_TO_NAME, setCurPage} from './Constants/HeaderItems';
import {useLocation} from "react-router-dom";

const PortfolioContainer = ({ children }) => {
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    setCurPage(PATH_TO_NAME[location.pathname]);
    window.scrollTo(0, 0);
  }, [])

  return (
      <div>
        <Layout>
          <Navbar isNavCollapsed={isNavCollapsed} />
          <Layout>
            <Header setIsNavCollapsed={setIsNavCollapsed} />
            <div className='content-section' id='content-section'>
              {children}
            </div>
          </Layout>
        </Layout>
      </div>
  );
}

export default PortfolioContainer;
