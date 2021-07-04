import './Projects.css';
import Text from "antd/es/typography/Text";

const ProjectCard = ({ name, description, link }) => {
  return (
      <div className='project-card'>
        <Text className='project-card-preview-name'>{name}</Text>
        <Text className='project-card-preview-desc'>{description}</Text>
      </div>
  );
};

export default ProjectCard;
