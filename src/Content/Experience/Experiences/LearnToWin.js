import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import Text from "antd/es/typography/Text";
import {Button, Image} from "antd";
import '../Experience.css';
import rapidGradingImg from "../../../Assets/rapidgrading.png";

const LearnToWin = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            I'm worked as a Software Engineering Intern at <a rel="noopener noreferrer nofollow" target='_blank' href='https://learntowin.us'>Learn To Win</a> during
            the summer of 2021.
          </Text>

          <br />
          <br />

          <Text className='experience-info-text'>
            As an intern, I was responsible for two large projects along with smaller features and bug fixes. I worked on a platform that offers a mobile-first approach
            to microlearning and is partnered with multiple NFL and NCAA teams along with the DoD.
            The first feature I worked on was a Rapid Grading system. Our grading system prior to this forced coaches to click on each student individually and grade
            the user. With the Rapid Grading system I built, coaches are able to see all responses for a question on one screen. They can then scroll through the
            questions and quickly grade them along with providing personalized feedback. This results in an average grading efficiency increase of <strong>65%</strong>.
            </Text>

          <br />
          <br />

          <Image width='75%' className='rapid-grading-img' alt='Rapid Grading Image' src={rapidGradingImg} preview={false}/>

          <br />
          <br />

          <Text className='experience-info-text'>
            The second feature I worked on was a certification system, where I integrated a 3rd party REST API to issue badges and certifications to learners.
            This feature has been heavily requested by coaches for months, and I was able to deliver it. It allows coaches to customize a certification and
            issue it to their learners upon completion of a lesson or quiz.
          </Text>
        </div>
      </PortfolioContainer>
  );
}

export default LearnToWin;
