import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import Text from "antd/es/typography/Text";
import {Button} from "antd";
import '../Experience.css';

const LearnToWin = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            I'm currently a Software Engineering Intern at <a rel="noopener noreferrer nofollow" target='_blank' href='https://learntowin.us'>Learn To Win</a>.&nbsp;
            &#128512;
          </Text>
        </div>
      </PortfolioContainer>
  );
}

export default LearnToWin;
