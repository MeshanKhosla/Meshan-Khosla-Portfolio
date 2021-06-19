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
  '/contact': '3',
}

export const PATH_TO_NAME = {
  '/': 'Home',
  '/projects': 'Projects',
  '/experience': 'Experience',
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
