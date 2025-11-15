import React from 'react';
import RichTextEditor from './RichTextEditor';

const OptionEditor = ({ index, value, onChange }) => {
  return (
    <div>
      <label className="label-text font-medium">{`Option ${index + 1}`}</label>
      <RichTextEditor
        value={value}
        onChange={(newValue) => onChange(index, newValue)}
      />
    </div>
  );
};

export default React.memo(OptionEditor);
