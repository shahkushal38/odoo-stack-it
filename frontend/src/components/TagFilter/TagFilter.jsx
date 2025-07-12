import React, { useState } from 'react';
import './TagFilter.css';

const TagFilter = ({ tags = [], onChange, initialSelected = [] }) => {
  tags = ['React', 'JWT', 'Vite', 'Authentication', 'MERN', 'Frontend', 'Backend', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'CSS', 'HTML', 'Git', 'Docker', 'AWS', 'Firebase', 'Redux']
  const [selected, setSelected] = useState(initialSelected);

  const handleTagClick = (tag) => {
    let newSelected;
    if (selected.includes(tag)) {
      newSelected = selected.filter(t => t !== tag);
    } else {
      newSelected = [...selected, tag];
    }
    setSelected(newSelected);
    onChange && onChange(newSelected);
  };

  return (
    <div className="tag-filter">
      {tags.map(tag => (
        <button
          key={tag}
          type="button"
          className={`tag-filter__tag${selected.includes(tag) ? ' tag-filter__tag--selected' : ''}`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter; 