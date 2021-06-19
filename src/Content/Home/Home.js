import { useEffect } from "react";
import '../../App.css'
import Navbar from "../../Navbar/Navbar";
import { Layout } from 'antd';
import Header from "../../Header/Header";
import { setCurPage } from '../../Constants/HeaderItems';

const Home = () => {

  useEffect(() => {
    setCurPage('Home');
  }, [])

  return (
      <div>
        <Layout>
          <Navbar />
          <Layout>
            <Header />
            <div className='content-section'>
              <h1>Home</h1>
            </div>
          </Layout>
        </Layout>
      </div>
  );
}

export default Home;
