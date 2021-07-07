import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";

const PathVisualizer = () => {
  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='project-desc-text'>
            In progress
          </Text>
        </div>
      </PortfolioContainer>
  );
};

export default PathVisualizer;
