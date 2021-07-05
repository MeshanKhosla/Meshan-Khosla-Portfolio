import './Projects.css';
import Text from "antd/es/typography/Text";
import {Link} from "react-router-dom";

const ProjectCard = ({ name, description, link }) => {
  return (
      <Link to={link}>
        <div className='project-card'>
          <Text className='project-card-preview-name'>{name}</Text>
          <Text className='project-card-preview-desc'>{description}</Text>
        </div>
      </Link>
  );
};

export default ProjectCard;
