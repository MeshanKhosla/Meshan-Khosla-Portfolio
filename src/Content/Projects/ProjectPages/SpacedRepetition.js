import {Link} from "react-router-dom";
import {Button} from "antd";
import Text from "antd/es/typography/Text";
import PortfolioContainer from "../../../PortfolioContainer";
import Highlight from 'react-highlight'
import Title from "antd/es/typography/Title";

const SpacedRepetition = () => {
  return (
      <PortfolioContainer>
        <Link to='/projects'>
          <Button className='back-to-exp-btn'>&#x25c0;</Button>
        </Link>
        <div>
          <Text className='project-desc-text'>
            I created a quiz app using principles of active learning and spaced repetition. Spaced repetition is
            the idea that newer questions and questions missed more frequently are seen more frequently by the user.
            If you'd like to learn more about this idea, you can read more <a rel="noopener noreferrer nofollow" target='_blank' href='https://en.wikipedia.org/wiki/Spaced_repetition'>here</a>.
            To implement this in code, I found it natural to use a Priority Queue, which uses a minheap to keep the 'smallest'
            item at the top, making access constant time. The value that the PQ sorts by is determined by a users answer and time
            remaining. If they get the question right in a little amount of time, the points increase by the time remaining and vice versa
            for an incorrect answer. This application is written in React and uses Redux as well as React Context API.
            The Python code I used to test the concept can be found below as well as the code and hosted site.
          </Text>
            <div className='project-buttons'>
              <Button href='https://spaced-repetition-quiz.netlify.app' target='_blank' type='primary'>
                Hosted Site
              </Button>
              <Button href='https://github.com/MeshanKhosla/Spaced-Repetition-Quiz-App' target='_blank' type='primary'>
                Code
              </Button>
            </div>
            <Title style={{textAlign: 'center'}} level={3}>Python code used to test concept</Title>
          <Highlight className="python-code" language={"python"}>{code}</Highlight>
        </div>
      </PortfolioContainer>
  );
};

const code = `from queue import PriorityQueue
class Question:
    def __init__(self, text, options, answer):
        self.text = text
        self.options = options
        self.answer = answer
        self.points = 100
        self.time_allowed = 20
questions = [
    (0, Question("Question 1", ["a", "b"], "a")),
    (1, Question("Question 2", ["a", "b"], "a")),
    (2, Question("Question 3", ["a", "b"], "b")),
    (3, Question("Question 4", ["a", "b"], "b")),
]
pq = PriorityQueue()
def alg():
    # Initial questions
    for q in questions:
        ask_question(q[1])
    update_pq()
    # Subsequent questions
    for _ in range(10): # Arbitrary amount
        curr_pq = pq.get()
        curr_question = curr_pq[1][1]
        ask_question(curr_question)
        pq.put((curr_question.points, (curr_pq[1][0], curr_question))) # .get() removes elem from a pq
    # Compute final score
    total = sum([q[1].points for q in questions])
    print(f"Result: {total / len(questions)}")
def update_pq():
    for q in questions:
        pq.put((q[1].points, q))
def ask_question(q):
    print(f"You have {q.time_allowed} seconds")
    print(q.text)
    correct = q.answer
    user_answer = input("Which is correct? " + str(q.options))
    if user_answer == correct:
        correct_answer(q)
    else:
        incorrect_answer(q)
    print("")
def correct_answer(q):
    print("Correct")
    time_remaining = int(input("Time remaining: "))
    q.points += time_remaining
    q.time_allowed -= get_change_time_amt(True, time_remaining)
    
def incorrect_answer(q):
    print("Incorrect")
    time_remaining = int(input("Time remaining: "))
    q.points -= time_remaining
    q.time_allowed += get_change_time_amt(False, time_remaining)
def get_change_time_amt(correct_ans, time_remaining):
    threshold_1, threshold_2 = 5, 2.5
    if not correct_ans:
        threshold_1, threshold_2 = 10, 5
    change_time = min(threshold_1, threshold_2, 
                     key=lambda x: abs((time_remaining / 2) - x))
    return change_time
alg()
`;

export default SpacedRepetition;
