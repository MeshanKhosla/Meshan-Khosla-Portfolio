import PortfolioContainer from "../../../PortfolioContainer";
import { Slide } from 'react-awesome-reveal';
import {Button} from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";
import '../Experience.css';

const HighSchool = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#11164;</Button>
        </Link>
        <div className='individual-experience-container'>
          <Title level={4}>FIRST Robotics</Title>
          <div className='experience-role-container'>
            <Text className='experience-role'>Team Captain</Text>
          </div>
          <Text>
            Robotics was the activity in High School that made me want to pursue computer science in college. Although I was initially a
            programmer on the team, I quickly had to learn other aspects of robotics such as CAD, mechanical, and electrical since our team
            was fairly new. We would regularly spend our time after school and on weekends (often until 8-9pm) working on ensuring our robot would
            be competition ready. At the time, I didn't realize how long we were spending every day because I genuinely enjoyed the process
            of thinking, prototyping, and building something really cool. As a team, we went from 35th to 5th in regional competition, and it was an
            unforgettable experience.
          </Text>
          <Title level={4}>Cross Country / Track & Field</Title>
          <div className='experience-role-container'>
            <Text className='experience-role'>Team Captain</Text>
          </div>
          <Text>
            I was a long distance runner in our school's Cross Country and Track team for 3 years, the last two as a team captain. In my first race I
            ran 2 miles in an incredible 16 minutes. In all seriousness, I'm very proud of the improvement I made over the years, running well over 1,000
            miles and eventually having a 2 mile PR of 11:17. Although I don't think titles mean much, it is always nice to go from below average to
            Most Improved to Most Valuable Runner in a few years.
          </Text>
          <Title level={4}>California Scholarship Federation (CSF)</Title>
          <div className='experience-role-container'>
            <Text className='experience-role'>Many</Text>
          </div>
          <Text>
            I was the Secretary, Treasurer, Vice President of CSF which is an organization aimed to recognize and encourage academic achievement
            for high schoolers. I led meetings, handled finances, handled the agenda, and did other miscellaneous tasks to ensure the club was
            successful.
          </Text>
        </div>
      </PortfolioContainer>
  );
}

export default HighSchool;
