import React, { useState } from 'react';
import './RichTextEditor.css';

const RichTextEditor = () => {
  const [content, setContent] = useState('');

  // For now, use a simple textarea as a placeholder
  // Replace with a full-featured editor (e.g., Quill, Slate) later
  return (
    <div className="rich-text-editor">
      <label className="rich-text-editor__label">Description:</label>
      <textarea
        className="rich-text-editor__textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your question here..."
        rows={6}
      />
      <div className="rich-text-editor__toolbar">
        {/* Toolbar buttons for bold, italic, etc. (dummy for now) */}
        <button type="button">B</button>
        <button type="button">I</button>
        <button type="button">S</button>
        <button type="button">😊</button>
        <button type="button">🔗</button>
        <button type="button">🖼️</button>
        <button type="button">•</button>
        <button type="button">1.</button>
        <button type="button">L</button>
        <button type="button">C</button>
        <button type="button">R</button>
      </div>
    </div>
  );
};

export default RichTextEditor;
