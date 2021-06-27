import PortfolioContainer from "../../PortfolioContainer";
import {Row, Col} from "antd";
import {Slide} from "react-awesome-reveal";
import './Projects.css';

const Projects = () => {
  return (
    <PortfolioContainer>
      <Row className='projects-container'>
        <Col className='projects'>
          <Slide duration={500} triggerOnce>
            <div className='project'>Coming Soon</div>
            <div className='project'>Coming Soon</div>
            <div className='project'>Coming Soon</div>
            <div className='project'>Coming Soon</div>
            <div className='project'>Coming Soon</div>
            <div className='project'>Coming Soon</div>
          </Slide>
        </Col>
      </Row>
    </PortfolioContainer>
  );
}

export default Projects;