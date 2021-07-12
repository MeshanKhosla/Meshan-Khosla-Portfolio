import PortfolioContainer from "../../../PortfolioContainer";
import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const PathVisualizer = () => {

  const pathFinderTabs = (
      <div className="alg-tabs">
        <Tabs>
          <TabList>
            <Tab>Dijkstra</Tab>
            <Tab>A*</Tab>
            <Tab>BFS</Tab>
            <Tab>DFS</Tab>
          </TabList>

          <TabPanel>
            <h2>
              Dijkstra's algorithm is one of the most popular shortest path finding
              algorithms. Dijkstra's, is not informed, meaning it will not know
              which direction to start the search from. Therefore, Dijkstra's looks
              similar to BFS since they both go in all directions where there is no
              barrier, However, Dijkstra's is not a FIFO algorithm, it is a greedy algorithm, meaning it does
              not simply check the nodes in the order they were placed into the
              queue. Instead, Dijkstra's uses a priority queue to get the current
              shortest path from the starting node to the current node. It then uses
              this node to find its' next node. Other informed search algorithms,
              such as A*, are based on Dijkstra's. Upon finding the end node,
              Dijkstra's traverses the path it's made backwards to find the shortest
              path.
            </h2>
          </TabPanel>
          <TabPanel>
            <h2>
              The A* pathfinding algorithm is very similar to
              Dijkstra's. A* introduces one more, component to
              Dijkstra's, known as the H score. The H score is short for heuristic,
              and it finds an estimate of the distance from the current node to
              the end node. In the, visualization, I used Manhattan distance, which
              finds an 'L' shape route to the path. Therefore, A* is often seen as
              a more efficient version of Dijkstra's since it is informed, meaning
              it is not simply trying all possibilities until it gets to the end. In
              the visualization,, you'll see that the computer knows in what general
              direction to go in, whereas Dijkstra's goes, in every direction where
              there isn't a barrier. The computation for the algorithm is F(n) =
              G(n) + H(n). The G score -- G(N) -- is the distance from the start
              node to the current, node. Adding the G score to the heuristic value
              gives us an F score, and we take the smallest F, score every iteration
              in order to find the shortest path.
            </h2>
          </TabPanel>
          <TabPanel>
            <h2>
              Breadth First Search (or BFS) is a shortest path finding algorithm
              that focuses on queues. Every neighbor that is not a barrier is
              placed into a queue, and then every neighbor of that, neighbor is
              places into a queue, and so on. It is called breadth first search
              because it, traverses the graph layer by layer. Unlike its' depth
              first search counterpart, BFS looks like it is expanding from the
              start node. BFS is a First In, First Out (FIFO) algorithm, meaning
              the, next node in the queue will be checked regardless of efficiency.
              When the ending node is found, BFS has kept track of which node every
              node came from, so it can now follow the path back to the start,
              resulting in the shortest path.
            </h2>
          </TabPanel>
          <TabPanel>
            <h2>
              Depth First Search (or DFS) is not a shortest path finding algorithm.
              This is why the visualization looks very inefficient, but I think
              it's an interesting comparison to BFS. In DFS, one neighbor is taken
              from the starting node, and that neighbor is explored further. This
              process continues with every visited neighbor. Since only one node is
              visited at a time, the visualization looks snake-like, where the
              snake is inefficiently traversing the entire node, looking for the end
              node. When the snake finds the end node, it traverses its' path,
              which often takes a long time.
            </h2>
          </TabPanel>
        </Tabs>
      </div>
  );

  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='project-desc-text'>
            I built a shortest path visualizer which added onto <a rel="noopener noreferrer nofollow" target='_blank' href='https://www.youtube.com/watch?v=JtiK0DOeI4A'>this video's</a>
            &nbsp;implementation. The video built a path visualizer for the A* path finding algorithm. I tweaked it to make it my
            own and added 3 new algorithms along with a starting screen. his path visualizer uses Pygame in order to
            demonstrate different algorithms. The 4 included algorithms are: A*, Breadth First Search, Dijkstra's, and
            Depth First Search. All of these, except for DFS, will find the shortest path from the start node to the end
            node. DFS, as you can tell by running the visualizer, is not used for shortest path. Overall, this path
            visualizer was actually a lot of fun to build. The grid setup as well as part of the A* algorithm was
            adapted from the video above, so that made the pygame aspect trivial. However, the
            algorithm implementations were done by me. BFS was the first graph traversal algorithm I learned, so I
            started with that. After implementing it normally with an adjacency list, I converted that code to use
            grid neighbors rather than list values. I repeated this process with the other 3 algorithms. It was
            challenging to determine which nodes should be classified as open (green) and closed (red) but after a
            little bit of trial and error, I was able to find a scheme I liked. The most surprising aspect of this was
            seeing DFS visualized. I know how it behaves with a set of nodes on a graph, but seeing it attempting to
            find a path to the end node was, well, pretty comical. See the code below as well as a description of each
            algorithm.
          </Text>
          <div className='project-buttons'>
            <Button href='https://replit.com/@MeshanKhosla/PathVisualizer' target='_blank' type='primary'>
              Hosted Site
            </Button>
            <Button href='https://github.com/MeshanKhosla/PathVisualizer' target='_blank' type='primary'>
              Code
            </Button>
          </div>
          {pathFinderTabs}
        </div>
      </PortfolioContainer>
  );
};

export default PathVisualizer;
