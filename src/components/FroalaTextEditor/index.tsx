// src/components/FroalaEditor.tsx
import React, { useState } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';

// Import Froala Editor CSS
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';

interface FroalaEditorProps {
  initialValue?: string;
  onContentChange?: (content: string) => void;
}

const config: Record<string, any> = {
  placeholderText: 'Edit Your Content Here!',
  heightMin: 200,
  charCounterCount: true,
  imageUpload: false,
  key: '9KH3cC4B3E3F2D2E3zPAENHMf1JPQRFZBTBf1WWEPYDbB3H3E2A14A19B7B5C6A2B1==',
  toolbarButtons: {
    moreText: { buttons: ['bold', 'italic', 'underline'], buttonsVisible: 6 },
    moreParagraph: { buttons: ['formatUL', 'formatOL', 'alignLeft', 'alignCenter', 'alignRight'], buttonsVisible: 5 },
    moreMisc: { buttons: ['undo', 'redo', 'html'], buttonsVisible: 3 },
  },
  events: {
    contentChanged: function () {
      console.log('Content changed!');
    },
  },
};

const FroalaTextEditor: React.FC<FroalaEditorProps> = ({ initialValue = '', onContentChange }) => {
  const [content, setContent] = useState<string>(initialValue);

  const handleModelChange = (model: string) => {
    setContent(model);
    if (onContentChange) {
      onContentChange(model);
    }
  };

  return (
    <FroalaEditorComponent
      key="froala-editor" // Force re-render with a unique key
      tag="textarea"
      model={content}
      onModelChange={handleModelChange}
      config={config}
    />
  );
};

export default FroalaTextEditor;