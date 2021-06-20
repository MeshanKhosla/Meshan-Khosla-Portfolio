import PortfolioContainer from "../../PortfolioContainer";
import { Slide } from 'react-awesome-reveal';
import './Home.css';
import {Row, Col, Image} from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";

const Home = () => {
  return (
    <PortfolioContainer>
      <Row className='home-container'>
        <Col className='home-left-column'>
          <Slide duration={500} triggerOnce>
            <Title level={3}>Hi, I'm Meshan</Title>
            <Text>I'm a student at UC Berkeley studying Computer Science</Text>
          </Slide>
        </Col>

        <Col className='home-right-column'>
          <Slide duration={500} direction={'right'} triggerOnce>
            <Image className='home-profile-img' preview={false} src='https://media-exp1.licdn.com/dms/image/C4E03AQHtHy6dt8Bn8Q/profile-displayphoto-shrink_400_400/0/1621569090285?e=1629936000&v=beta&t=s9IlzVf247hNtmefgOXJ6XrGQUywmR2V6aHyWcGS0b4'/>
          </Slide>
        </Col>
      </Row>
    </PortfolioContainer>
  );
}

export default Home;
