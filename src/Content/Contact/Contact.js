import { useState } from "react";
import PortfolioContainer from "../../PortfolioContainer";
import Draggable from 'react-draggable';
import {Resizable} from "re-resizable";
import './Contact.css';
import linkedinImage from '../../Assets/linkedinImg.png';
import emailImage from '../../Assets/emailImg.png';
import {Button, notification, } from "antd";
import 'antd/dist/antd.css';
import {Slide} from "react-awesome-reveal";


const Contact = () => {
  const [isContentEditable, setIsContentEditable] = useState(false);

  const openNotificationWithIcon = type => {
    const msg = `Everything is ${isContentEditable ? 'no longer' : 'now'} editable.
      ${isContentEditable ? 'But you can still edit the icons!' : ''}`

    notification[type]({
      message: 'Success!',
      description: msg,
    });
  };

  const handleContentEditable = () => {
    // Need to this this b/c setIsContentEditable is async
    const opp = !isContentEditable;
    document.body.setAttribute('contentEditable', opp.toString());
    openNotificationWithIcon('success')
    setIsContentEditable(!isContentEditable);
  }
  return (
      <PortfolioContainer>
        <Slide duration={500}>
        <div className='contact-title'>
          <p>I couldn't figure out a good way to make this page look good.</p>
          <p>So drag/resize to make it look nice!</p>
          <Button onClick={handleContentEditable}>
            {`Click here to make text ${isContentEditable ? 'non-' : ''}editable`}
          </Button>
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
        </Slide>
      </PortfolioContainer>
  );
}

export default Contact;
