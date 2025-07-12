import React from 'react';
import AnswerCard from '../components/AnswerCard';
import RichTextEditor from '../components/RichTextEditor';
import './QuestionDetail.css';

// Dummy question and answers
const question = {
  id: 1,
  title: 'How to use React Router with Vite?',
  description: 'I am trying to set up routing in my Vite + React app. What is the recommended way?',
  tags: ['React', 'Vite', 'React Router'],
  votes: 5,
};
const answers = [
  {
    id: 1,
    content: 'You can use react-router-dom v6+ with Vite. Install it and wrap your app with <BrowserRouter>.',
    votes: 3,
    accepted: true,
  },
  {
    id: 2,
    content: 'Make sure to configure vite.config.js for SPA fallback. Use <Routes> and <Route> for navigation.',
    votes: 2,
    accepted: false,
  },
];

const QuestionDetail = () => (
  <div className="question-detail">
    <h1 className="question-detail__title">{question.title}</h1>
    <div className="question-detail__tags">
      {question.tags.map(tag => (
        <span key={tag} className="question-detail__tag">{tag}</span>
      ))}
    </div>
    <p className="question-detail__desc">{question.description}</p>
    <div className="question-detail__votes">Votes: {question.votes}</div>
    <h2 className="question-detail__answers-title">Answers</h2>
    <div className="question-detail__answers">
      {answers.map(a => (
        <AnswerCard key={a.id} answer={a} />
      ))}
    </div>
    <h2 className="question-detail__your-answer">Your Answer</h2>
    <RichTextEditor />
    <button className="question-detail__submit">Submit Answer</button>
  </div>
);

export default QuestionDetail;
