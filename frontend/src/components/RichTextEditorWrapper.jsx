import React, { Suspense } from "react";

const LazyRichTextEditor = React.lazy(() => import("./RichTextEditor"));

export default function RichTextEditorWrapper(props) {
  return (
    <Suspense
      fallback={
        <div className="p-4 border rounded text-center text-slate-500">
          Loading editor…
        </div>
      }
    >
      <LazyRichTextEditor {...props} />
    </Suspense>
  );
}
