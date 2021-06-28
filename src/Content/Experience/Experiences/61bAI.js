import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import '../Experience.css';

const SixtyOneBAI = () => {
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

export default SixtyOneBAI;
