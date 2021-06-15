import Home from './Home/Home'
import Contact from "./Contact/Contact";
import Experience from "./Experience/Experience";
import Projects from "./Projects/Projects";

const ContentContainer = ({ currentPage }) => {
  switch(currentPage) {
    case 'home':
      return <Home />
    case 'projects':
      return <Projects />
    case 'experience':
      return <Experience />
    case 'contact':
      return <Contact />
    default:
      return <Home />
  }
}

export default ContentContainer;