import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import TextTransition, {presets} from "react-text-transition";
import {CATEGORIES, getCurPageName, PATH_TO_NAME} from "../Constants/HeaderItems";
import '../Header/Header.css';

const Header = ({ setIsNavCollapsed }) => {
  const location = useLocation();
  /* curPageName is the previous page for a second page before it changes */
  const [prevPage] = useState(getCurPageName());
  /* Initially set curPage to prevPage to give scroll effect */
  const [curPage, setCurPage] = useState(prevPage);

  const handleScroll = () => {
    const distanceY = window.pageYOffset || document.documentElement.scrollTop
    const headerElement = document.getElementById('main-header');
    const contentSection = document.getElementById('content-section');

    if (distanceY > 0) {
      headerElement.classList.add('minimized-header');
      headerElement.classList.add('collapsed-navbar');
      contentSection.classList.add('collapsed-navbar');
      setIsNavCollapsed(true);
    } else {
      headerElement.classList.remove('minimized-header');
      headerElement.classList.remove('collapsed-navbar');
      contentSection.classList.remove('collapsed-navbar');
      setIsNavCollapsed(false);
    }
  }

  useEffect(() => {
    document.title = `Meshan Khosla | ${PATH_TO_NAME[location.pathname]}`;
    window.addEventListener('scroll', handleScroll)


    /* Timeout is so header text doesn't immediately change */
    setTimeout(() => {
      setCurPage(PATH_TO_NAME[location.pathname]);
    }, 50)
  }, [])

  const findDirection = () => {
    if (CATEGORIES.indexOf(curPage) > CATEGORIES.indexOf(prevPage)) {
      return 'up';
    }
    return 'down';
  }

  return (
      <div id='main-header' className="content-header-section">
        <div className='changing-text'>
          <TextTransition
              text={curPage}
              springConfig={presets.wobbly}
              direction={findDirection()}
          />
        </div>
      </div>
  )
}

export default Header;