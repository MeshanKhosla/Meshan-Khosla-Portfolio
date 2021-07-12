import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";

const Gitlet = () => {
  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='project-desc-text'>
            Gitlet is a version control system which I designed and implemented as a project in
            UC Berkeley's&nbsp;
            <a rel="noopener noreferrer nofollow" target='_blank' href='https://sp21.datastructur.es/'>
              CS61B Data Structures
            </a> course. We were given what commands to implement, but no skeleton code
            or explanation how the commands work behind the scenes. The commands that I implemented include&nbsp;
            <em>init, add, commit, checkout, branch, reset, merge, rm, log,</em> and <em>status</em>. Through
            this project, I was able to gain an excellent knowledge of how Git functions which has helped me incredibly
            as a software engineer. Since this is a class project, I cannot post the code publicly nor explain the
            techniques I used, but can do so to an employer if needed.
          </Text>
          <div className='project-buttons'>
            <Button disabled style={{ backgroundColor: '#1990FD', color: 'white' }}>
              Code (Available upon request)
            </Button>
          </div>
        </div>
      </PortfolioContainer>
  );
};

export default Gitlet;
