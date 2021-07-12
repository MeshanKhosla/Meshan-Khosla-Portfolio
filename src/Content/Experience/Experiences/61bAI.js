import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import '../Experience.css';

const SixtyOneBAI = () => {
  return (
      <PortfolioContainer>
        <Link to='/experience'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='experience-info-text'>
            I work as an Academic Intern in UC Berkeley's summer Data Structures course,
            <a rel="noopener noreferrer nofollow" target='_blank' href='https://cs61bl.org/'> CS61BL</a>.
            &nbsp;Since the summer iteration of the course is heavily focused on lab work, I help with running labs
            which often includes helping students debug their code, answering conceptual questions, and helping with
            project design. Teaching computer science is something I genuinely enjoy doing and I loved this course
            when I took it so I decided that this would be a perfect opportunity, and it has been an amazing
            experience so far. Topics covered in this course include <em>Java basics</em>, <em>Testing</em>,&nbsp;
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

export default SixtyOneBAI;
