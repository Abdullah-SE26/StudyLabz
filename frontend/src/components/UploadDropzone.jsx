// frontend/components/UploadDropzone.jsx
import { useState } from "react";
import { generateUploadButton } from "@uploadthing/react";
import { toast } from "react-hot-toast";

// Use meta env for backend URL
const backendUrl = import.meta.env.VITE_API_URL;

// Generate a pre-configured UploadButton for your backend
export const UploadButton = generateUploadButton({
  url: `${backendUrl}/api/uploadthing`,
});

export default function UploadDropzone({ endpoint, onUploadComplete, maxFiles = 1 }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  return (
    <UploadButton
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res?.length) {
          const urls = res.map((file) => file.fileUrl);
          setUploadedFiles(urls);
          onUploadComplete?.(urls); // send uploaded URLs back to parent
          toast.success("Upload completed!");
        }
      }}
      onUploadError={(err) => {
        console.error("Upload error:", err);
        toast.error("Upload failed!");
      }}
      maxFiles={maxFiles}
    >
      <button
        type="button"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Upload File
      </button>
    </UploadButton>
  );
}
