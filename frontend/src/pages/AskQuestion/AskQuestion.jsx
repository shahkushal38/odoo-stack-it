import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagSelector from '../../components/TagSelector/TagSelector';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import { isAuthenticated } from '../../utils/api';
import { questionService } from '../../services/questionService';
import './AskQuestion.css';

const AskQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
  };

  const handleTagsChange = (selectedTags) => {
    setFormData(prev => ({
      ...prev,
      tags: selectedTags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation only happens on submit
    if (!formData.title.trim()) {
      alert('Please enter a title for your question');
      return;
    }

    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      alert('Please enter a description for your question');
      return;
    }

    if (formData.tags.length === 0) {
      alert('Please select at least one tag');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        alert('Please log in to post a question');
        navigate('/login');
        return;
      }

      // Prepare the request body
      const questionData = {
        title: formData.title.trim(),
        description: formData.description,
        tags: formData.tags,
        createdAt: new Date().toISOString()
      };

      console.log('Submitting question:', questionData);

      // Make API call using quesgittion service
      const result = await questionService.createQuestion(questionData);

      console.log('Question created successfully:', result);

      // Navigate to the question detail page or home
      // You can use result.question_id to navigate to the specific question
      alert('Question posted successfully!');
      navigate('/');

    } catch (error) {
      console.error('Error submitting question:', error);
      alert(`Failed to submit question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ask-question">
      <div className="ask-question__container">
        <h1 className="ask-question__title">Ask a Question</h1>
        <p className="ask-question__subtitle">
          Share your knowledge and help others by asking a well-formatted question.
        </p>

        <form className="ask-question__form" onSubmit={handleSubmit}>
          <div className="ask-question__field">
            <label htmlFor="title" className="ask-question__label">
              Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="What's your question? Be specific."
              className="ask-question__input"
              value={formData.title}
              onChange={handleTitleChange}
              maxLength={300}
            />
            <small className="ask-question__help">
              Be specific and imagine you're asking another person
            </small>
          </div>

          <div className="ask-question__field">
            <label className="ask-question__label">
              Description *
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Provide all the information someone would need to answer your question..."
            />
            <small className="ask-question__help">
              Include details about what you've tried and what you're trying to achieve
            </small>
          </div>

          <div className="ask-question__field">
            <label className="ask-question__label">
              Tags *
            </label>
            <TagSelector
              selectedTags={formData.tags}
              onChange={handleTagsChange}
            />
            <small className="ask-question__help">
              Add up to 5 tags to describe what your question is about
            </small>
          </div>

          <div className="ask-question__actions">
            <button
              type="button"
              className="ask-question__cancel"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ask-question__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting Question...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;
