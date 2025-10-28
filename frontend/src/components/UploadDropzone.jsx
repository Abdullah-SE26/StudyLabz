import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function UploadDropzone({ file, onFileSelect }) {
  const [preview, setPreview] = useState(null);

  // Sync preview with parent-controlled file
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!["image/png", "image/jpeg"].includes(selectedFile.type)) {
      toast.error("Only PNG and JPG images are allowed!");
      return;
    }

    onFileSelect?.(selectedFile); // parent manages state now
  };

  const handleRemove = () => {
    onFileSelect?.(null); // parent clears the file
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-xl border-gray-300 hover:border-blue-400 transition relative">
      {!file ? (
        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer text-gray-700">
          <input
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
          <ImagePlus className="w-12 h-12 text-gray-500" />
          <p className="font-medium">Drag & drop an image here</p>
          <p className="text-sm text-gray-500">or click to browse (PNG/JPG only)</p>
        </label>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-lg border shadow-sm"
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={handleRemove}
            >
              <X className="w-4 h-4 inline" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
