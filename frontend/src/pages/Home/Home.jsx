
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import './Home.css';

// Dummy data for questions
const questions = [
  {
    id: 1,
    title: 'How to use React Router with Vite?',
    description: 'I am trying to set up routing in my Vite + React app. What is the recommended way?',
    tags: ['React', 'Vite', 'React Router'],
    answers: 2,
    votes: 5,
  },
  {
    id: 2,
    title: 'Best practices for JWT authentication?',
    description: 'What are the best practices for implementing JWT authentication in a MERN stack app?',
    tags: ['JWT', 'Authentication', 'MERN'],
    answers: 3,
    votes: 8,
  },
];

const Home = () => (
  <div className="home">
    <h1 className="home__title">All Questions</h1>
    <div className="home__list">
      {questions.map(q => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </div>
  </div>
);

export default Home;
