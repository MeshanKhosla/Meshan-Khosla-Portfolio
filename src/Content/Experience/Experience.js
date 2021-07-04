import PortfolioContainer from "../../PortfolioContainer";
import {Timeline} from "antd";
import {Link} from "react-router-dom";
import './Experience.css';
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import EXPERIENCES from "../../Constants/Experiences";
import {Slide} from "react-awesome-reveal";

const Experience = () => {

  return (
      <PortfolioContainer>
        <Slide duration={500} direction='right' triggerOnce>
        <div className='experience-title'>
          <Title>What I've done so far</Title>
          <Text>Click on any item for more details!</Text>
        </div>
        <div className='experience-timeline'>
          <Timeline mode='alternate'>
            {EXPERIENCES.map(exp => (
              <Timeline.Item color={exp.color}>
                <Link to={exp.link}>
                  <Text className='experience-position'>{exp.position}</Text>
                  <br />
                  <Text>
                    {exp.company} | {exp.date}
                  </Text>
                </Link>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
        </Slide>
      </PortfolioContainer>
  );
}

export default Experience;
