import React, { useRef } from "react";
import JoditEditor from "jodit-react";

export default function RichTextEditor({ value, onChange }) {
  const editor = useRef(null);

  const config = {
    readonly: false,
    height: 500,
    toolbarButtonSize: "middle",
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "ul",
      "ol",
      "link",
      "unlink",
      "source",
      "fullsize",
    ],
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    events: {
      // ESC to exit fullscreen
      keydown: (e) => {
        if (e.key === "Escape") {
          const ed = editor.current?.editor;
          if (ed && ed.isFullSize) {
            ed.toggleFullSize();
          }
        }
      },
    },
  };

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      tabIndex={1}
      onBlur={(newContent) => onChange(newContent)}
    />
  );
}
