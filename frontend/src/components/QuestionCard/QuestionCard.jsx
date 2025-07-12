import React from 'react';
import './QuestionCard.css';

const QuestionCard = ({ question }) => (
  <div className="question-card">
    <div className="question-card__header">
      <h2 className="question-card__title">{question.title}</h2>
      <div className="question-card__tags">
        {question.tags.map(tag => (
          <span key={tag} className="question-card__tag">{tag}</span>
        ))}
      </div>
    </div>
    <p className="question-card__desc">{question.description}</p>
    <div className="question-card__footer">
      <span className="question-card__answers">Answers: {question.answers}</span>
      <span className="question-card__votes">Votes: {question.votes}</span>
    </div>
  </div>
);

export default QuestionCard;
