import { useState } from 'react';
import { Layout } from 'antd';
import Navbar from './Navbar/Navbar';
import Header from './Header/Header';
import ContentContainer from "./Content/ContentContainer";
import './App.css';
import 'antd/dist/antd.css';

const { Content } = Layout;
const CATEGORIES = [
    'Home',
    'Projects',
    'Experience',
    'Contact'
]

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [index, setIndex] = useState(0);

  const handlePageChange = (page, idx) => {
    setCurrentPage(page);
    setIndex(idx);
  }
  return (
    <div className="App">
      <Layout>
        <Navbar handlePageChange={handlePageChange}/>
        <Layout>
          <Content className='main-content'>
            <Header name={CATEGORIES[index % CATEGORIES.length]}/>
            <Layout>

              <ContentContainer currentPage={currentPage} />

            </Layout>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
