import { useHistory } from "react-router-dom";
import LearnToWin from "./Experiences/LearnToWin";
import SixtyOneBAI from "./Experiences/61bAI";
import CoreResearch from "./Experiences/CoreResearch";
import HighSchool from "./Experiences/HighSchool";

const ExperienceContainer = ({ page }) => {
  const history = useHistory();
  switch(page) {
    case 'LearnToWin':
      return <LearnToWin />
    case '61bAI':
      return <SixtyOneBAI />
    case 'CoreResearch':
      return <CoreResearch />
    case 'HighSchool':
      return <HighSchool />
    default:
      history.push('/experience');
      window.location.reload();
      return;
  }
}

export default ExperienceContainer;