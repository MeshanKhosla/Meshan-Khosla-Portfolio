import { useEffect } from 'react';
import ContentContainer from "./Content/ContentContainer";
import './App.css';
import 'antd/dist/antd.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

const App = () => {

  useEffect(() => {
    localStorage.removeItem('curPage');
  }, [])

  return (
      <Router>
        <Switch>
          <Route exact path='/'>
            <ContentContainer currentPage='Home' />
          </Route>
          <Route path='/projects'>
            <ContentContainer currentPage='Projects' />
          </Route>
          <Route path='/experience'>
            <ContentContainer currentPage='Experience' />
          </Route>
          <Route path='/contact'>
            <ContentContainer currentPage='Contact' />
          </Route>
          <Route path='/'>
            <ContentContainer currentPage='Invalid' />
          </Route>
        </Switch>
      </Router>
  );
}

export default App;
