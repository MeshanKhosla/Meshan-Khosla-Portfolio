export const CATEGORIES = [
  'Home',
  'Projects',
  'Experience',
  'Contact'
]

export const PATH_TO_INDEX = {
  '/': '0',
  '/projects': '1',
  '/projects/Gitlet': '1',
  '/projects/PathVisualizer': '1',
  '/projects/SpacedRepetition': '1',
  '/projects/StockDigest': '1',
  '/projects/Portfolio': '1',
  '/projects/Arduino': '1',
  '/experience': '2',
  '/experience/61bTutor': '2',
  '/experience/LearnToWin': '2',
  '/experience/61bAI': '2',
  '/experience/CoreResearch': '2',
  '/experience/HighSchool': '2',
  '/contact': '3',
}

export const PATH_TO_NAME = {
  '/': 'Home',
  '/projects': 'Projects',
  '/projects/Gitlet': 'Gitlet',
  '/projects/PathVisualizer': 'Path Visualizer',
  '/projects/SpacedRepetition': 'Spaced Repetition',
  '/projects/StockDigest': 'Stock Digest',
  '/projects/Portfolio': 'Portfolio',
  '/projects/Arduino': 'Arduino',
  '/experience': 'Experience',
  '/experience/61bTutor': '61B Tutor',
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
