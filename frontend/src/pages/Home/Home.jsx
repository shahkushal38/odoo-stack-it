import React, { useEffect, useState } from 'react';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import { getAllQuestions } from '../../api';
import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 2;

  useEffect(() => {
    setLoading(true);
    getAllQuestions(page, limit)
      .then(data => {
        setQuestions(data.questions);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load questions');
        setLoading(false);
      });
  }, [page]);

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
      {pagination && (
        <div className="home__pagination">
          <button
            className="home__pagination-btn"
            disabled={!pagination.has_prev}
            onClick={() => setPage(pagination.prev_page)}
          >
            Prev
          </button>
          {[...Array(pagination.total_pages)].map((_, i) => (
            <button
              key={i+1}
              className={`home__pagination-btn${pagination.current_page === i+1 ? ' active' : ''}`}
              onClick={() => setPage(i+1)}
              disabled={pagination.current_page === i+1}
            >
              {i+1}
            </button>
          ))}
          <button
            className="home__pagination-btn"
            disabled={!pagination.has_next}
            onClick={() => setPage(pagination.next_page)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
