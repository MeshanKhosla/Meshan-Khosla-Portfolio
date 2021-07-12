import PortfolioContainer from "../../../PortfolioContainer";
import { Slide } from 'react-awesome-reveal';
import {Row, Col, Image, Divider, Button} from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import '../Experience.css';

const CoreResearch = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            I work in the <a rel="noopener noreferrer nofollow" target='_blank' href='https://www.ocf.berkeley.edu/~mwilkers/'>CoRE</a>
            &nbsp;research group at UC Berkeley which is focused on computer science education. Specifically, we study computational
            texts such as graphics and interactive games. I work on building a game in Python which explores how students interact
            with such games and whether social justice has an impact on their learning. This project is ongoing and will resume when
            the semester begins.
          </Text>
        </div>
      </PortfolioContainer>
  );
}

export default CoreResearch;
