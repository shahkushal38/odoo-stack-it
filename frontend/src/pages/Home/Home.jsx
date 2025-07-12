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
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    // getAllQuestions()
    //   .then(data => {
    //     setQuestions(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     setError('Failed to load questions');
    //     setLoading(false);
    //   });
  }, []);

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
    </div>
  );
};

export default Home;
