import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './QuestionCard.css';


const QuestionCard = ({ question }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/question/${question._id}`);
  };

  const shortDesc = question.description?.length > 100
    ? question.description.slice(0, 100) + '...'
    : question.description;

  return (
  
      <div className="question-card" onClick={handleClick}>
      <div className="question-card__header">
        <h2 className="question-card__title">{question.title}</h2>
        <div className="question-card__tags">
          {question.tags && question.tags.map(tag => (
            <span key={tag} className="question-card__tag">{tag}</span>
          ))}
        </div>
      </div>
      <div className="question-card__desc">
        <div className="question-card__desc" dangerouslySetInnerHTML={{ __html: shortDesc }} />
      </div>
      <div className="question-card__footer">
        <span className="question-card__answers">Answers: {question.num_answers ?? 0}</span>
      </div>
    </div>
  );
};

export default QuestionCard;
