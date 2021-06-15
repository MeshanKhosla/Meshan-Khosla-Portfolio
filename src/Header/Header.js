import '../Header/Header.css';
import TextTransition, {presets} from "react-text-transition";

const Header = ({ name }) => {
  return (
      <div className="content-header-section">
        <div className='changing-text'>
          <TextTransition
              text={name}
              springConfig={ presets.wobbly }
          />
        </div>
      </div>
  )
}

export default Header;