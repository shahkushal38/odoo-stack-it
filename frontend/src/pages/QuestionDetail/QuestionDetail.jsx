import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { isAuthenticated } from '../../utils/api';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import './QuestionDetail.css';

const QuestionDetail = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newAnswer, setNewAnswer] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    useEffect(() => {
        fetchQuestionDetails();
    }, [questionId]);

    const fetchQuestionDetails = async () => {
        try {
            setLoading(true);
            const data = await questionService.getQuestionById(questionId);
            setQuestion(data);
        } catch (err) {
            setError(err.message || 'Failed to load question details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleVote = async (answerId, voteType) => {
        if (!isAuthenticated()) {
            alert('Please log in to vote');
            return;
        }

        try {
            // TODO: Implement vote API call
            console.log(`Voting ${voteType} for answer ${answerId}`);
            // Refresh question data after voting
            await fetchQuestionDetails();
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Please try again.');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!isAuthenticated()) {
            alert('Please log in to submit an answer');
            return;
        }

        if (!newAnswer.trim() || newAnswer === '<p><br></p>') {
            alert('Please enter your answer');
            return;
        }

        try {
            setSubmittingAnswer(true);
            // TODO: Implement submit answer API call
            console.log('Submitting answer:', newAnswer);
            setNewAnswer('');
            await fetchQuestionDetails();
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer. Please try again.');
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const VoteButtons = ({ votes, userUpvoted, userDownvoted, onVote, answerId }) => (
        <div className="vote-buttons">
            <button
                className={`vote-button vote-button--up ${userUpvoted ? 'vote-button--active' : ''}`}
                onClick={() => onVote(answerId, 'up')}
                title="Upvote"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L20 12H16V20H8V12H4L12 4Z" fill="currentColor" />
                </svg>
            </button>
            <span className="vote-count">{votes.up - votes.down}</span>
            <button
                className={`vote-button vote-button--down ${userDownvoted ? 'vote-button--active' : ''}`}
                onClick={() => onVote(answerId, 'down')}
                title="Downvote"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20L4 12H8V4H16V12H20L12 20Z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );

    const AnswerCard = ({ answer }) => (
        <div className="answer-card">
            <div className="answer-card__content">
                <div className="answer-card__vote-section">
                    <VoteButtons
                        votes={answer.votes}
                        userUpvoted={answer.user_upvoted}
                        userDownvoted={answer.user_downvoted}
                        onVote={handleVote}
                        answerId={answer._id}
                    />
                </div>
                <div className="answer-card__main">
                    <div
                        className="answer-card__text"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                    />
                    <div className="answer-card__meta">
                        <span className="answer-card__date">
                            {formatDate(answer.created_at)}
                        </span>
                        <span className="answer-card__author">
                            User ID: {answer.user_id}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="question-detail">
                <div className="question-detail__container">
                    <div className="loading-spinner">Loading question...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="question-detail">
                <div className="question-detail__container">
                    <div className="error-message">
                        <h2>Error</h2>
                        <p>{error}</p>
                        <button onClick={() => navigate('/')} className="btn btn--primary">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="question-detail">
                <div className="question-detail__container">
                    <div className="error-message">
                        <h2>Question Not Found</h2>
                        <p>The question you're looking for doesn't exist.</p>
                        <button onClick={() => navigate('/')} className="btn btn--primary">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="question-detail">
            <div className="question-detail__container">
                {/* Question Header */}
                <div className="question-detail__header">
                    <h1 className="question-detail__title">{question.title}</h1>
                    <div className="question-detail__meta">
                        <span className="question-detail__date">
                            Asked {formatDate(question.created_at)}
                        </span>
                        <span className="question-detail__author">
                            by User ID: {question.user_id}
                        </span>
                    </div>
                </div>

                {/* Question Content */}
                <div className="question-detail__content">
                    <div className="question-detail__vote-section">
                        <VoteButtons
                            votes={{ up: 0, down: 0 }} // TODO: Add question votes
                            userUpvoted={false}
                            userDownvoted={false}
                            onVote={handleVote}
                            answerId={question._id}
                        />
                    </div>
                    <div className="question-detail__main">
                        <div
                            className="question-detail__description"
                            dangerouslySetInnerHTML={{ __html: question.description }}
                        />

                        {/* Question Image */}
                        {question.image_urls && (
                            <div className="question-detail__image">
                                <img src={question.image_urls} alt="Question" />
                            </div>
                        )}

                        {/* Tags */}
                        <div className="question-detail__tags">
                            {question.tags.map(tag => (
                                <span key={tag} className="question-detail__tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="question-detail__answers-section">
                    <h2 className="question-detail__answers-title">
                        {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? 's' : ''}
                    </h2>

                    {question.answers && question.answers.length > 0 ? (
                        <div className="question-detail__answers">
                            {question.answers.map(answer => (
                                <AnswerCard key={answer._id} answer={answer} />
                            ))}
                        </div>
                    ) : (
                        <div className="question-detail__no-answers">
                            <p>No answers yet. Be the first to answer this question!</p>
                        </div>
                    )}
                </div>

                {/* Your Answer Section */}
                <div className="question-detail__your-answer">
                    <h2 className="question-detail__your-answer-title">Your Answer</h2>
                    <RichTextEditor
                        value={newAnswer}
                        onChange={setNewAnswer}
                        placeholder="Write your answer here..."
                    />
                    <div className="question-detail__answer-actions">
                        <button
                            className="btn btn--primary"
                            onClick={handleSubmitAnswer}
                            disabled={submittingAnswer}
                        >
                            {submittingAnswer ? 'Posting Answer...' : 'Post Answer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetail; 