import PortfolioContainer from "../../PortfolioContainer";
import { Slide } from 'react-awesome-reveal';
import './Home.css';
import {Row, Col, Image } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import profileImg from '../../Assets/profileImg.JPG';
import {Link} from "react-router-dom";
import {CONCEPT_SKILLS, SOFTWARE_SKILLS} from "../../Constants/Skills";

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
                interested in frontend, backend, theory, education, robotics, or any field where
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

        <div className='home-title'>
          <Title>Skills</Title>
        </div>
        <Row className='home-skills'>
          <Col className='home-left-column-skills'>
            <Slide duration={500} triggerOnce>
              <Title level={3}>Languages & Libraries</Title>
              <div className='home-skill-cards-container'>
                {SOFTWARE_SKILLS.map(skill => (
                  <div className={`home-skill-card ${skill}-card`}>{skill}</div>
                ))}
              </div>
            </Slide>
          </Col>
          <Col className='home-right-column-skills'>
            <Slide duration={500} triggerOnce direction='right'>
              <Title level={3}>Concepts & Software</Title>
              <div className='home-skill-cards-container'>
                {CONCEPT_SKILLS.map(skill => (
                    <div className={`home-skill-card ${skill}-card`}>{skill}</div>
                ))}
              </div>
            </Slide>
          </Col>
        </Row>


        <div className='home-title'>
          <Title>Outside Of Programming</Title>
        </div>
        <Row className='home-outside-of-programming'>
          I do other stuff
        </Row>

      </Row>
    </PortfolioContainer>
  );
}

export default Home;
