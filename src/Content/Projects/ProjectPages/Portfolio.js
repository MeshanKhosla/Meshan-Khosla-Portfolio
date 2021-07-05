import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import PortfolioContainer from "../../../PortfolioContainer";

const Portfolio = () => {
  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text>In progress</Text>
        </div>
      </PortfolioContainer>
  );
};

export default Portfolio;
