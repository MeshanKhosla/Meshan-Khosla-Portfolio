import Home from './Home/Home'
import Contact from "./Contact/Contact";
import Experience from "./Experience/Experience";
import Projects from "./Projects/Projects";

const ContentContainer = ({ currentPage }) => {
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
      return <Home />
  }
}

export default ContentContainer;