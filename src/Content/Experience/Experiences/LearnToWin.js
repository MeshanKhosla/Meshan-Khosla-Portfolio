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
          <Text>In progress</Text>
        </div>
      </PortfolioContainer>
  );
}

export default LearnToWin;
