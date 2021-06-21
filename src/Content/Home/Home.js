import PortfolioContainer from "../../PortfolioContainer";
import { Slide } from 'react-awesome-reveal';
import './Home.css';
import {Row, Col, Image, Divider} from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import profileImg from '../../Assets/profileImg.JPG';
import {Link} from "react-router-dom";

const Home = () => {
  return (
    <PortfolioContainer>
      <Row className='home-container'>

        <Col className='home-left-column'>
          <Slide duration={500} triggerOnce>
            <Title level={3}>Hi, I'm Meshan Khosla</Title>
              <Text>
                I'm a student at UC Berkeley studying Computer Science.
                I've been programming since 9th grade and I've loved it since. I'm
                interested in frontend, backend, theory, robotics, or any field where
                software can be used. Feel free to scroll down to see my skills
                and things I enjoy doing outside of programming. You can also check out my&nbsp;
                <Link to='/projects'>projects</Link>, <Link to='/experience'>experiences</Link>,
                and how to <Link to='/contact'>contact</Link> me!
              </Text>
          </Slide>
        </Col>
        <Col className='home-right-column'>
          <Slide duration={500} direction={'right'} triggerOnce>
            <Image width='75%' className='home-profile-img' alt='Profile Image' src={profileImg} preview={false}/>
          </Slide>
        </Col>

        <Divider />
        <div className='home-skills-title'>
          <Title>Skills</Title>
        </div>
        <Row className='home-skills'>
          <Col className='home-left-column-skills'>
            <Slide duration={500} triggerOnce>
              <Title level={3}>Languages & Libraries</Title>
              <Text>
                Skills go here
              </Text>
            </Slide>
          </Col>
          <Col className='home-right-column-skills'>
            <Slide duration={500} triggerOnce>
              <Title level={3}>Concepts & Software</Title>
              <Text>
                Skills go here
              </Text>
            </Slide>
          </Col>
        </Row>

      </Row>
    </PortfolioContainer>
  );
}

export default Home;
