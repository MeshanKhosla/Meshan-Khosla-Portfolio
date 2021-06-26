import {useState} from "react";
import PortfolioContainer from "../../PortfolioContainer";
import {Row, Timeline} from "antd";
import {Link} from "react-router-dom";
import './Experience.css';
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import {EXPERIENCE_TO_INFO} from "../../Constants/Experiences";

const Experience = () => {

  return (
      <PortfolioContainer>
        <div className='experience-title'>
          <Title>What I've done so far</Title>
          <Text>Click on any item for more details!</Text>
        </div>
        <div className='experience-timeline'>
          <Timeline mode='alternate'>
            {Object.keys(EXPERIENCE_TO_INFO).map(exp => (
              <Timeline.Item color={EXPERIENCE_TO_INFO[exp][2]}>
                <Link to={EXPERIENCE_TO_INFO[exp][3]}>
                  <Text className='experience-position'>{exp}</Text>
                  <br />
                  <Text>
                    {EXPERIENCE_TO_INFO[exp][0]} | {EXPERIENCE_TO_INFO[exp][1]}
                  </Text>
                </Link>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </PortfolioContainer>
  );
}

export default Experience;
