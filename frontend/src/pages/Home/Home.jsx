import React, { useEffect, useState, useMemo } from 'react';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import TagFilter from '../../components/TagFilter/TagFilter';
import { getAllQuestions } from '../../api';
import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 2;
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllQuestions(page, limit)
      .then((data) => {
        setQuestions(data.questions);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load questions");
        setLoading(false);
      });
  }, [page]);

  // Derive all unique tags from questions
  const allTags = useMemo(() => {
    const tagSet = new Set();
    questions.forEach(q => (q.tags || []).forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [questions]);

  // Filter questions by search and tags
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(search.toLowerCase()));
      const matchesTags =
        selectedTags.length === 0 ||
        (q.tags && selectedTags.every(tag => q.tags.includes(tag)));
      return matchesSearch && matchesTags;
    });
  }, [questions, search, selectedTags]);

  if (loading) return <div className="home">Loading questions...</div>;
  if (error) return <div className="home">{error}</div>;

  return (
    <div className="home">
      <h1 className="home__title">All Questions</h1>
      <div className="home__filters">
        <SearchBar onSearch={setSearch} placeholder="Search questions..." />
        <TagFilter tags={allTags} onChange={setSelectedTags} />
      </div>
      <div className="home__list">
        {filteredQuestions.length === 0 ? (
          <div className="home__no-results">No questions found.</div>
        ) : (
          filteredQuestions.map(q => (
            <QuestionCard key={q._id} question={q} />
          ))
        )}
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
              key={i + 1}
              className={`home__pagination-btn${
                pagination.current_page === i + 1 ? " active" : ""
              }`}
              onClick={() => setPage(i + 1)}
              disabled={pagination.current_page === i + 1}
            >
              {i + 1}
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
