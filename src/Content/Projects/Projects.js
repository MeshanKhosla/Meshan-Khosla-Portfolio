import PortfolioContainer from "../../PortfolioContainer";
import {Row, Col} from "antd";
import {Slide} from "react-awesome-reveal";
import './Projects.css';
import Title from "antd/es/typography/Title";
import ProjectCard from "./ProjectCard";
import PROJECTS from "../../Constants/ProjectItems";

const Projects = () => {
  return (
    <PortfolioContainer>
      <div className='experience-title'>
        <Title level={3}>Click on any project for more details!</Title>
      </div>
      <Row className='projects-container'>
        <Col className='projects'>
          <Slide duration={500} triggerOnce>
            {PROJECTS.map(proj => (
              <ProjectCard
                  key={proj.link}
                  name={proj.name}
                  description={proj.description}
                  link={proj.link}
              />
            ))}
          </Slide>
        </Col>
      </Row>
    </PortfolioContainer>
  );
}

export default Projects;