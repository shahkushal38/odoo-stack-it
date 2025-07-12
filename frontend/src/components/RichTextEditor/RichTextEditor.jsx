import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Emoji from '@tiptap/extension-emoji';
import './RichTextEditor.css';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // File input for image upload
  const fileInputRef = useRef();

  const handleImageUpload = (event) => {
    console.log('Image upload triggered');
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log('Inserting image into editor');
          editor.chain().focus().setImage({ src: e.target.result }).run();
        } catch (error) {
          console.error('Error inserting image:', error);
          alert('Failed to insert image. Please try again.');
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Failed to read image file. Please try again.');
      };
      reader.readAsDataURL(file);
    }

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleImageButtonClick = (e) => {
    // Prevent any form submission or validation
    e.preventDefault();
    e.stopPropagation();

    console.log('Image button clicked');

    // Ensure the editor is focused before opening file dialog
    editor.commands.focus();

    // Small delay to ensure focus is set
    setTimeout(() => {
      fileInputRef.current.click();
    }, 100);
  };

  // Generic button handler to prevent form interference
  const handleButtonClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="tiptap-menubar">
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
        onMouseDown={(e) => e.preventDefault()}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
        onMouseDown={(e) => e.preventDefault()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleUnderline().run())}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline"
        onMouseDown={(e) => e.preventDefault()}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleStrike().run())}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strikethrough"
        onMouseDown={(e) => e.preventDefault()}
      >
        <s>S</s>
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
        onMouseDown={(e) => e.preventDefault()}
      >
        • List
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleOrderedList().run())}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Numbered List"
        onMouseDown={(e) => e.preventDefault()}
      >
        1. List
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign('left').run())}
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        title="Align Left"
        onMouseDown={(e) => e.preventDefault()}
      >
        ⇤
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign('center').run())}
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        title="Align Center"
        onMouseDown={(e) => e.preventDefault()}
      >
        ≡
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign('right').run())}
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        title="Align Right"
        onMouseDown={(e) => e.preventDefault()}
      >
        ⇥
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => {
          const url = window.prompt('Enter the URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        })}
        className={editor.isActive('link') ? 'is-active' : ''}
        title="Insert Link"
        onMouseDown={(e) => e.preventDefault()}
      >
        🔗
      </button>
      <button
        type="button"
        onClick={handleImageButtonClick}
        title="Insert Image"
        onMouseDown={(e) => e.preventDefault()}
      >
        🖼️
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().insertContent('😀').run())}
        title="Insert Emoji"
        onMouseDown={(e) => e.preventDefault()}
      >
        😀
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().unsetAllMarks().clearNodes().run())}
        title="Clear Formatting"
        onMouseDown={(e) => e.preventDefault()}
      >
        🧹
      </button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = "Write your question description here..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      Link,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Emoji,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Keep editor content in sync with value prop
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line
  }, [value]);

  return (
    <div className="rich-text-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor; 