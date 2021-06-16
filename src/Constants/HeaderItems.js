export const CATEGORIES = [
  'Home',
  'Projects',
  'Experience',
  'Contact'
]

const getCurPage = () => {
  return localStorage.getItem('curPage');
}

export const getCurPageName = () => {
  return !!getCurPage() ? getCurPage().split(',')[0] : 'Home';
}

export const getCurPageIdx = () => {
  return !!getCurPage() ? getCurPage().split(',')[1] : 0;
}

const getPrevPage = () => {
  return localStorage.getItem('prevPage');
}

export const getPrevPageName = () => {
  return !!getPrevPage() ? getPrevPage().split(',')[0] : 'Home';
}
