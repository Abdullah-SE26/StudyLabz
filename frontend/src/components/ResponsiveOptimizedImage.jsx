// ResponsiveOptimizedImage.jsx
import React, { useState } from "react";
import { cloudinaryUrl } from "../../lib/cloudinaryHelper";

const breakpoints = [320, 480, 768, 1024, 1280, 1536]; 

const ResponsiveOptimizedImage = ({ publicId, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  // Generate srcset dynamically for breakpoints
  const srcSet = breakpoints
    .map((w) => `${cloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(", ");

  // Small blurred placeholder
  const placeholder = cloudinaryUrl(publicId, { blurPlaceholder: true });

  // Fallback src (default)
  const src = cloudinaryUrl(publicId);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blurred placeholder */}
      <img
        src={placeholder}
        alt={alt}
        className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Full responsive image */}
      <img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 320px) 280px,
               (max-width: 480px) 440px,
               (max-width: 768px) 720px,
               (max-width: 1024px) 980px,
               (max-width: 1280px) 1240px,
               1536px"
        alt={alt}
        className="w-full h-full object-contain transition-opacity duration-500"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ResponsiveOptimizedImage;
