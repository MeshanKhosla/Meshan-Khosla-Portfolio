import '../Header/Header.css';
import TextTransition, { presets } from "react-text-transition";
import { CATEGORIES, getPrevPageName } from "../Constants/HeaderItems";

const Header = ({ name }) => {

  const findDirection = () => {
    if (CATEGORIES.indexOf(name) > CATEGORIES.indexOf(getPrevPageName())) {
      return 'up';
    }
    return 'down';
  }

  return (
      <div className="content-header-section">
        <div className='changing-text'>
          <TextTransition
              text={name}
              springConfig={ presets.wobbly }
              direction={findDirection()}
          />
        </div>
      </div>
  )
}

export default Header;