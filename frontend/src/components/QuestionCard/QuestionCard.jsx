import React from 'react';
import './QuestionCard.css';


const QuestionCard = ({ question }) => (
  <div className="question-card">
    <div className="question-card__header">
      <h2 className="question-card__title">{question.title}</h2>
      <div className="question-card__tags">
        {question.tags && question.tags.map(tag => (
          <span key={tag} className="question-card__tag">{tag}</span>
        ))}
      </div>
    </div>
    <p className="question-card__desc">{question.description}</p>
    <div className="question-card__footer">
      <span className="question-card__answers">Answers: {question.num_answers ?? 0}</span>
    </div>
  </div>
);

export default QuestionCard;
