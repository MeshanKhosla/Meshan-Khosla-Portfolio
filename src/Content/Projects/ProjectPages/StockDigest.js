import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import PortfolioContainer from "../../../PortfolioContainer";

const StockDigest = () => {
  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='project-desc-text'>
            This stock digest script was really made out of need. I had bought a few stocks that I wanted to keep track
            of, and wanted automate that process. Since I couldn't find a similar program online, I decided to create my
            own. The script uses the Yahoo finance API in order get the current stock price along with yesterday's
            closing price. Then, it does the relevant computations and adds those messages to a list. I represented each
            individual stock as a Python object since I enjoy OOP. To send the e-mail, I used MIMEText. The
            most tedious aspect of this program was getting the e-mail to repeat every day. I did everything from
            running an infinite while loop in my code to experimenting with AWS lambda functions. The former did not
            seem feasible since that would require me to leave my computer on at all times as well as leave the script
            running. As far as AWS goes, it seemed overkill for what I was trying to do. Thankfully, I found Windows
            Task Scheduler which lets you schedule programs/scripts to be run, so that's exactly what I did. Overall,
            this is a very practical script for any casual stock traders. I still receive e-mails
            everyday on the performance of my stocks. Click the button below to see the code, and you can try it
            yourself by following the instructions in the README.
          </Text>
        </div>
        <div className='project-buttons'>
          <Button href='https://github.com/MeshanKhosla/StockDigest' target='_blank' type='primary'>
            Code
          </Button>
        </div>
      </PortfolioContainer>
  );
};

export default StockDigest;
