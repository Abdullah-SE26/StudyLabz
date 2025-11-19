import RichTextEditor from "./RichTextEditor";

export default function OptionEditor({ value, onChange }) {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-base-50">
      <label className="text-sm font-medium text-gray-700">MCQ Options</label>
      <p className="text-xs text-gray-500">
        Enter all 4 options below — one per line.
      </p>

      <RichTextEditor value={value} onChange={onChange} />
    </div>
  );
}
