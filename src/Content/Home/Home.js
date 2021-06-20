import { useEffect, useState } from "react";
import '../../App.css'
import Navbar from "../../Navbar/Navbar";
import { Layout } from 'antd';
import Header from "../../Header/Header";
import { setCurPage } from '../../Constants/HeaderItems';

const Home = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    setCurPage('Home');
  }, [])

  return (
      <div>
        <Layout>
          <Navbar isNavCollapsed={isNavCollapsed} />
          <Layout>
            <Header setIsNavCollapsed={setIsNavCollapsed} />
            <div className='content-section' id='content-section'>
              <h1>Home</h1>
            </div>
          </Layout>
        </Layout>
      </div>
  );
}

export default Home;
