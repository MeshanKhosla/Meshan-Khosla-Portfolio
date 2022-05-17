import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import '../Experience.css';

const SixtyOneBTutor = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            As an 8 hour tutor for CS 61B (UC Berkeley Data Structures), I conducted office hours, led review sessions, and answered student&nbsp;
						questions,and worked on a course staff of 50+ TAs to run this course, which consisted of 1500+ students. The topics included <em>Java basics</em>, <em>Testing</em>,&nbsp;
            <em>Linked Lists</em>, <em>ADT's</em>, <em>Hash Tables</em> (My favorite data structure), <em>Git</em>, <em>Asymptotics</em>,&nbsp;
            <em>Disjoint Sets</em>, <em>Trees</em>, <em>B-trees</em>, <em>Red-Black Trees</em>, <em>Tries</em>, <em>DFS</em>,&nbsp;
            <em>Graphs</em>, <em>BFS</em>, <em>Dijsktra's</em>, <em>A*</em>, <em>MST's</em>, <em>Heaps</em>, <em>Priority Queues</em>,&nbsp;
            <em>Selection Sort</em>, <em>Insertion Sort</em>, <em>Quicksort</em>, <em>Mergesort</em>, <em>Heapsort</em>,&nbsp;
            <em>Radix Sort(s)</em> and more.
          </Text>
        </div>
      </PortfolioContainer>
  );
}

export default SixtyOneBTutor;
