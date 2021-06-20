import '../../App.css'
import { Layout } from "antd";
import Navbar from "../../Navbar/Navbar";
import Header from "../../Header/Header";
import {useEffect, useState} from "react";
import {setCurPage} from "../../Constants/HeaderItems";

const Experience = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    setCurPage('Experience');
  }, [])

  return (
      <div>
        <Layout>
          <Navbar isNavCollapsed={isNavCollapsed} />
          <Layout>
            <Header setIsNavCollapsed={setIsNavCollapsed} />
            <div className='content-section' id='content-section'>
              <h1>Experience</h1>
            </div>
          </Layout>
        </Layout>
      </div>
  );
}

export default Experience;
