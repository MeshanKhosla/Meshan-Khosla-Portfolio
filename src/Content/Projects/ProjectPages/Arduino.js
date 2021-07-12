import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import PortfolioContainer from "../../../PortfolioContainer";
import Title from "antd/es/typography/Title";

const Arduino = () => {
  const ArduinoProject = ({name, url, desc}) => (
      <div style={{ marginBottom: '10px' }}>
        <Title level={4}><a rel="noopener noreferrer nofollow" target='_blank' href={url}>{name}</a></Title>
        <Text className='experience-info-text'>{desc}</Text>
      </div>
  )

  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            I was bored during the summer after high school and I missed Robotics so I decided to start playing around
            with an Arduino and other electrical engineering concepts. All of the code and schematics for what I made
            can be found&nbsp;
            <a rel="noopener noreferrer nofollow" target='_blank' href='https://github.com/MeshanKhosla/Arduino-Projects'>here</a>! Here's a brief
            summary of some of the things I built:
          </Text>
          <hr/>

          <ArduinoProject
            name='Touchless Cubing Timer'
            url='https://github.com/MeshanKhosla/Arduino-Projects/tree/master/Projects/SecretCode'
            desc={'A timer for cubing that doesn\'t require any form of touch. Uses an ultrasonic sensor to detect if a hand is within the threshold.'}
          />
          <ArduinoProject
            name='Secret Code'
            url='https://github.com/MeshanKhosla/Arduino-Projects/tree/master/Projects/SecretCode'
            desc='There is a code that, when entered, lights up an LED and moves a motor'
          />
          <ArduinoProject
            name={'SongPlayer - We Didn\'t start the fire'}
            url='https://github.com/MeshanKhosla/Arduino-Projects/tree/master/Projects/SongPlayer_-_We_didn_t_start_the_fire'
            desc={'I used 5 LEDs, a passive buzzer, and an Arduino Notes library to create the melody for "We Didn\'t Start The Fire" by Billy Joel.'}
          />
          <ArduinoProject
            name='SongPlayer - The Office Theme Song'
            url='https://github.com/MeshanKhosla/Arduino-Projects/tree/master/Projects/SongPlayer_-_The_Office_theme_song'
            desc={'Similar the the WDSTF project, I adjusted the melody to match The Office\'s theme song'}
          />
          <ArduinoProject
            name='The Office theft alarm'
            url='https://github.com/MeshanKhosla/Arduino-Projects/tree/master/Projects/Office_Theft_Alarm'
            desc='I used a tilt switch to activate an alarm whenever it was activated. For example, if you were to touch the breadboard, it would play The Office theme song.'
          />
          <ArduinoProject
            name='Controlling a Servo with a potentiometer'
            url='https://github.com/MeshanKhosla/Arduino-Projects/tree/master/Projects/Servo_with_potentiometer'
            desc='I used a small potentiometer to control a servo ranging from 0-180 degrees.'
          />
      </div>
</PortfolioContainer>
);
};

export default Arduino;
