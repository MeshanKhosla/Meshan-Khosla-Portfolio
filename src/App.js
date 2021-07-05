import { useEffect } from 'react';
import ContentContainer from "./Content/ContentContainer";
import './App.css';
import 'antd/dist/antd.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import ExperienceContainer from "./Content/Experience/ExperienceContainer";
import ProjectsContainer from "./Content/Projects/ProjectsContainer";

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
          <Route path='/projects/Gitlet'>
            <ProjectsContainer page='Gitlet' />
          </Route>
          <Route path='/projects/PathVisualizer'>
            <ProjectsContainer page='PathVisualizer' />
          </Route>
          <Route path='/projects/SpacedRepetition'>
            <ProjectsContainer page='SpacedRepetition' />
          </Route>
          <Route path='/projects/StockDigest'>
            <ProjectsContainer page='StockDigest' />
          </Route>
          <Route path='/projects/Portfolio'>
            <ProjectsContainer page='Portfolio' />
          </Route>
          <Route path='/projects/Arduino'>
            <ProjectsContainer page='Arduino' />
          </Route>
          <Route path='/projects'>
            <ContentContainer currentPage='Projects' />
          </Route>
          <Route path='/experience/LearnToWin'>
            <ExperienceContainer page='LearnToWin' />
          </Route>
          <Route path='/experience/61bAI'>
            <ExperienceContainer page='61bAI' />
          </Route>
          <Route path='/experience/CoreResearch'>
            <ExperienceContainer page='CoreResearch' />
          </Route>
          <Route path='/experience/HighSchool'>
            <ExperienceContainer page='HighSchool' />
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
