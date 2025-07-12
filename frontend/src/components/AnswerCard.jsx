import React from 'react';
import './AnswerCard.css';

const AnswerCard = ({ answer }) => (
  <div className={`answer-card${answer.accepted ? ' accepted' : ''}`}>
    <div className="answer-card__content">{answer.content}</div>
    <div className="answer-card__footer">
      <span className="answer-card__votes">Votes: {answer.votes}</span>
      {answer.accepted && <span className="answer-card__badge">Accepted</span>}
    </div>
  </div>
);

export default AnswerCard;
