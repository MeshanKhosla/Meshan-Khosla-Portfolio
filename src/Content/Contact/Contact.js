import PortfolioContainer from "../../PortfolioContainer";
import Draggable from 'react-draggable';
import {Resizable} from "re-resizable";
import './Contact.css';
import linkedinImage from '../../Assets/linkedinImg.png';
import emailImage from '../../Assets/emailImg.png';
import Title from "antd/es/typography/Title";
import {Link} from "react-router-dom";
import {Image} from "antd";

const Contact = () => {
  return (
      <PortfolioContainer>
        <div className='contact-title'>
          <Title level={3}>Drag/Resize to make your own layout!</Title>
        </div>

        <div className='contact-container' style={{ height: '1000px' }}>
        <Draggable>
          <Resizable
              defaultSize={{
                width: 200,
                height: 360
              }}
              style={{
                background: `url(${linkedinImage})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                cursor: 'move',
              }}
              lockAspectRatio={true}
          >
            <div className='linkedin-img'>
              <a rel="noopener noreferrer nofollow" target='_blank' href='https://linkedin.com/in/meshankhosla'>
                <p>/in/meshankhosla</p>
              </a>
            </div>
          </Resizable>
        </Draggable>

          <Draggable>
            <Resizable
                defaultSize={{
                  width: 200,
                  height: 360
                }}
                style={{
                  background: `url(${emailImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  cursor: 'move',
                }}
                lockAspectRatio={true}
            >
              <div className='email-img'>
                <a rel="noopener noreferrer nofollow" target='_blank' href='mailto:mkhosla@berkeley.edu'>
                  <p>mkhosla@berkeley.edu</p>
                </a>
              </div>
            </Resizable>
          </Draggable>
        </div>
      </PortfolioContainer>
  );
}

export default Contact;
