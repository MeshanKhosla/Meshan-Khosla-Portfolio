import '../../App.css'
import { Layout } from "antd";
import Navbar from "../../Navbar/Navbar";
import Header from "../../Header/Header";
import { useEffect } from "react";
import { setCurPage } from "../../Constants/HeaderItems";

const Contact = () => {
  useEffect(() => {
    setCurPage('Contact');
  }, [])

  return (
      <div>
        <Layout>
          <Navbar/>
          <Layout>
            <Header/>
            <div className='content-section'>
              <h1>Contact</h1>
            </div>
          </Layout>
        </Layout>
      </div>
  );
}

export default Contact;
