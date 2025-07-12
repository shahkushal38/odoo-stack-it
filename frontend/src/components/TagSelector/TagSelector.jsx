import React, { useState } from 'react';
import './TagSelector.css';

const TagSelector = ({ selectedTags = [], onChange, maxTags = 5 }) => {
  const [newTag, setNewTag] = useState('');
  const [suggestedTags] = useState(['React', 'JWT', 'Vite', 'Authentication', 'MERN', 'Frontend', 'Backend', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'CSS', 'HTML', 'Git', 'Docker', 'AWS', 'Firebase', 'Redux']);

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < maxTags) {
      onChange([...selectedTags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const handleInputBlur = () => {
    if (newTag.trim()) {
      addTag(newTag);
    }
  };

  const addSuggestedTag = (tag) => {
    if (!selectedTags.includes(tag) && selectedTags.length < maxTags) {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="tag-selector">
      {/* Selected Tags Display */}
      <div className="tag-selector__selected">
        {selectedTags.map(tag => (
          <div key={tag} className="tag-selector__selected-tag">
            <span className="tag-selector__tag-text">{tag}</span>
            <button
              type="button"
              className="tag-selector__remove-btn"
              onClick={() => removeTag(tag)}
              title="Remove tag"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Input for new tags */}
      {selectedTags.length < maxTags && (
        <div className="tag-selector__input-container">
          <input
            type="text"
            className="tag-selector__input"
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleInputKeyPress}
            onBlur={handleInputBlur}
            maxLength={20}
          />
          <button
            type="button"
            className="tag-selector__add-btn"
            onClick={() => addTag(newTag)}
            disabled={!newTag.trim()}
            title="Add tag"
          >
            +
          </button>
        </div>
      )}

      {/* Suggested Tags */}
      {selectedTags.length < maxTags && (
        <div className="tag-selector__suggestions">
          <small className="tag-selector__suggestions-label">Suggested tags:</small>
          <div className="tag-selector__suggested-tags">
            {suggestedTags
              .filter(tag => !selectedTags.includes(tag))
              .slice(0, 10) // Show only first 10 suggestions
              .map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="tag-selector__suggested-tag"
                  onClick={() => addSuggestedTag(tag)}
                  disabled={selectedTags.length >= maxTags}
                >
                  {tag}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <small className="tag-selector__help">
        {selectedTags.length}/{maxTags} tags selected
        {selectedTags.length >= maxTags && (
          <span className="tag-selector__limit-reached"> - Maximum tags reached</span>
        )}
      </small>
    </div>
  );
};

export default TagSelector;
