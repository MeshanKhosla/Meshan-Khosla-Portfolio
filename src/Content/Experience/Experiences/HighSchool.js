import PortfolioContainer from "../../../PortfolioContainer";
import { Slide } from 'react-awesome-reveal';
import {Row, Col, Image, Divider, Button} from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import '../Experience.css';

const HighSchool = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#11164;</Button>
        </Link>
        <div>
          <Text>In progress</Text>
        </div>
      </PortfolioContainer>
  );
}

export default HighSchool;
