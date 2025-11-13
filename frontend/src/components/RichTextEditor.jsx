import React, { useRef, memo } from "react";
import JoditEditor from "jodit-react";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useRef(null);

  const config = {
    readonly: false,
    height: 500,
    iframe: false,
    toolbarSticky: false,
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
    disablePlugins: ["file", "image", "video"], // Disable upload plugins
    events: {
      keydown: (e) => {
        if (e.key === "Escape") {
          const ed = editor.current?.editor;
          if (ed && ed.isFullSize) {
            ed.toggleFullSize();
          }
        }
      },
      beforePaste: (event) => {
        // Prevent pasting images/videos
        const clipboardData = event.clipboardData || window.clipboardData;
        const items = clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/") || items[i].type.startsWith("video/")) {
              event.preventDefault();
              return false;
            }
          }
        }
      },
      drop: (event) => {
        // Prevent drag-and-drop images/videos
        if (event.dataTransfer?.files?.length > 0) {
          const files = Array.from(event.dataTransfer.files);
          const hasMedia = files.some((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
          if (hasMedia) {
            event.preventDefault();
            return false;
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
};

export default memo(RichTextEditor);
