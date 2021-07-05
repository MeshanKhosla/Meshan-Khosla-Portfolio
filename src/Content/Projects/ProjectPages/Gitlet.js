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
          <Text>
            Gitlet is a version control system which I designed and implemented as a project in
            UC Berkeley's&nbsp;
            <a rel="noopener noreferrer nofollow" target='_blank' href='https://sp21.datastructur.es/'>
              CS61B Data Structures
            </a> course. Although we were given what commands to implement, there was hardly any skeleton code
            or explanation how certain commands work behind the scenes. The commands that I implemented include&nbsp;
            <em>init, add, commit, checkout, branch, reset, merge, rm, log,</em> and <em>status</em>. Since this
            is a class project, I cannot post the code publicly but can provide it to an employer if needed.
          </Text>
        </div>
      </PortfolioContainer>
  );
};

export default Gitlet;
