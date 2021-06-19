import Home from './Home/Home'
import Contact from "./Contact/Contact";
import Experience from "./Experience/Experience";
import Projects from "./Projects/Projects";
import { useHistory } from "react-router-dom";

const ContentContainer = ({ currentPage }) => {
  const history = useHistory();
  switch(currentPage) {
    case 'Home':
      return <Home />
    case 'Projects':
      return <Projects />
    case 'Experience':
      return <Experience />
    case 'Contact':
      return <Contact />
    default:
      history.push('/');
      window.location.reload();
      return;
  }
}

export default ContentContainer;