export const CATEGORIES = [
  'Home',
  'Projects',
  'Experience',
  'Contact'
]

export const PATH_TO_INDEX = {
  '/': '0',
  '/projects': '1',
  '/experience': '2',
  '/experience/LearnToWin': '2',
  '/experience/61bAI': '2',
  '/experience/CoreResearch': '2',
  '/experience/HighSchool': '2',
  '/contact': '3',
}

export const PATH_TO_NAME = {
  '/': 'Home',
  '/projects': 'Projects',
  '/experience': 'Experience',
  '/experience/LearnToWin': 'Learn To Win',
  '/experience/61bAI': '61B AI',
  '/experience/CoreResearch': 'Core Research',
  '/experience/HighSchool': 'High School',
  '/contact': 'Contact',
}

export const setCurPage = page => {
  localStorage.setItem('curPage', page);
}

const getCurPage = () => {
  return localStorage.getItem('curPage');
}

export const getCurPageName = () => {
  return !!getCurPage() ? getCurPage().split(',')[0] : 'Home';
}
