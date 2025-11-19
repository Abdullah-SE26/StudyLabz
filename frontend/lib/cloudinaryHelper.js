// cloudinaryHelper.js
export function cloudinaryUrl(publicId, options = {}) {
  const base = "https://res.cloudinary.com/dhqyjs4tk/image/upload/";
  const transformations = [];

  if (options.width) {
    transformations.push(`w_${options.width}`);
  } else {
    transformations.push("w_auto", "dpr_auto");
  }

  transformations.push("f_auto", "q_auto");

  if (options.blurPlaceholder) {
    transformations.push("e_blur:200", "w_50");
  }

  return `${base}${transformations.join(",")}/${publicId}.png`;
}
