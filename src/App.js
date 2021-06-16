import { useState } from 'react';
import { Layout } from 'antd';
import Navbar from './Navbar/Navbar';
import Header from './Header/Header';
import ContentContainer from "./Content/ContentContainer";
import {CATEGORIES,  getCurPageIdx, getCurPageName} from './Constants/HeaderItems';
import './App.css';
import 'antd/dist/antd.css';

const { Content } = Layout;

const App = () => {
  const [currentPage, setCurrentPage] = useState(getCurPageName());
  const [textIndex, setTextIndex] = useState(getCurPageIdx());

  const handlePageChange = (page, idx) => {
    localStorage.setItem('prevPage', getCurPageName().toString())
    localStorage.setItem('curPage', [page, idx].toString())
    setCurrentPage(page);
    setTextIndex(idx);
  }
  return (
    <div className="App">
      <Layout>
        <Navbar handlePageChange={handlePageChange}/>
        <Layout>
          <Header name={CATEGORIES[textIndex % CATEGORIES.length]} />
          <Content className='main-content'>
            <ContentContainer currentPage={currentPage} />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
