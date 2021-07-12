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
          <Text className='project-desc-text'>
            I decided to make a portfolio to display the projects that I've created and my experience so far. Sure,
            this all could've been on Linkedin but I wanted to try out some different React libraries and just
            experiment with building a project from scratch. It's always fun to write 'hacky' code
            that won't go through code review and no one will read. But if you want to read the code for whatever
            reason, click the button below!
          </Text>
          <div className='project-buttons'>
            <Button onClick={() => alert('You\'re already on the site!')} href='https://tinyurl.com/PortfolioRedirect' target='_blank' type='primary'>
              Hosted Site
            </Button>
            <Button href='https://github.com/MeshanKhosla/Meshan-Khosla-Portfolio' target='_blank' type='primary'>
              Code
            </Button>
          </div>
        </div>
      </PortfolioContainer>
  );
};

export default Portfolio;
