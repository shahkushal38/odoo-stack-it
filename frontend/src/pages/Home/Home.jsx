
import React, { useEffect, useState } from 'react';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import { getAllQuestions } from '../../api';
import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllQuestions()
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load questions');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="home">Loading questions...</div>;
  if (error) return <div className="home">{error}</div>;

  return (
    <div className="home">
      <h1 className="home__title">All Questions</h1>
      <div className="home__list">
        {questions.map(q => (
          <QuestionCard key={q._id} question={q} />
        ))}
      </div>
    </div>
  );
};

export default Home;
