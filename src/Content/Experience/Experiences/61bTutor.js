import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import '../Experience.css';

const SixtyOneBTutor = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            I am currently an Academic Tutor for CS 61B &#128516;
          </Text>
        </div>
      </PortfolioContainer>
  );
}

export default SixtyOneBTutor;
