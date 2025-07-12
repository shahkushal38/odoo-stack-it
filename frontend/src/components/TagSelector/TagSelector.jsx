import React, { useState } from 'react';
import './TagSelector.css';

const dummyTags = ['React', 'JWT', 'Vite', 'Authentication', 'MERN', 'Frontend', 'Backend'];

const TagSelector = () => {
  const [selected, setSelected] = useState([]);

  const toggleTag = tag => {
    setSelected(selected.includes(tag)
      ? selected.filter(t => t !== tag)
      : [...selected, tag]);
  };

  return (
    <div className="tag-selector">
      <label className="tag-selector__label">Tags:</label>
      <div className="tag-selector__tags">
        {dummyTags.map(tag => (
          <button
            key={tag}
            type="button"
            className={`tag-selector__tag${selected.includes(tag) ? ' selected' : ''}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;
