import { useHistory } from "react-router-dom";
import Gitlet from "./ProjectPages/Gitlet";
import PathVisualizer from "./ProjectPages/PathVisualizer";
import SpacedRepetition from "./ProjectPages/SpacedRepetition";
import StockDigest from "./ProjectPages/StockDigest";
import Portfolio from "./ProjectPages/Portfolio";
import Arduino from "./ProjectPages/Arduino";

const ProjectsContainer = ({ page }) => {
  const history = useHistory();
  switch(page) {
    case 'Gitlet':
      return <Gitlet />
    case 'PathVisualizer':
      return <PathVisualizer />
    case 'SpacedRepetition':
      return <SpacedRepetition />
    case 'StockDigest':
      return <StockDigest />
    case 'Portfolio':
      return <Portfolio />
    case 'Arduino':
      return <Arduino />
    default:
      history.push('/projects');
      window.location.reload();
      return;
  }
}

export default ProjectsContainer;