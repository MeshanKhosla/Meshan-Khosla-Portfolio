import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import TextTransition, {presets} from "react-text-transition";
import {CATEGORIES, getCurPageName, PATH_TO_NAME, PATH_TO_CSS_CLASS} from "../Constants/HeaderItems";
import '../Header/Header.css';

const Header = ({ setIsNavCollapsed }) => {
  const location = useLocation();
  /* curPageName is the previous page for a second page before it changes */
  const [prevPage] = useState(getCurPageName());
  /* Initially set curPage to prevPage to give scroll effect */
  const [curPage, setCurPage] = useState(prevPage);

  /* Expand or collapse the side navbar */
  const handleNavbarCollapseOrExpand = (shouldCollapse) => {
    const headerElement = document.getElementById('main-header');
    const contentSection = document.getElementById('content-section');
    if (shouldCollapse) {
      headerElement.classList.add('minimized-header');
      headerElement.classList.add('collapsed-navbar');
      contentSection.classList.add('collapsed-navbar');
      contentSection.classList.add('minimized-header');
      setIsNavCollapsed(true);
    } else {
      headerElement.classList.remove('minimized-header');
      headerElement.classList.remove('collapsed-navbar');
      contentSection.classList.remove('collapsed-navbar');
      contentSection.classList.remove('minimized-header');
      setIsNavCollapsed(false);
    }
  }
  const handleScroll = () => {
    const distanceY = window.pageYOffset || document.documentElement.scrollTop
    // If the screen width is <= 768 px, don't resize navbar
    if (!window.matchMedia("(min-width: 768px)").matches) {
      return;
    }
    if (distanceY > 0) {
      handleNavbarCollapseOrExpand(true);
    } else {
      handleNavbarCollapseOrExpand(false);
    }
  }

  /* Changes navbar setting based on screen size */
  const handleResize = () => {
    // If the screen width is <= 768 px
    if (!window.matchMedia("(min-width: 768px)").matches) {
      handleNavbarCollapseOrExpand(true)
    }
  }
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) {
      handleNavbarCollapseOrExpand(true)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    document.title = `Meshan Khosla | ${PATH_TO_NAME[location.pathname]}`;

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
        <div className='changing-text' id='changing-text'>
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