import React, { useState } from "react";
import DOMPurify from "dompurify";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Send,
  Flag,
  Link2,
} from "lucide-react";
import { IconBrandOpenai } from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import toast from "react-hot-toast";
import CommentsSection from "./CommentsSection";
import { useStore } from "../store/authStore";

import ReportModal from "./ReportModal"; // Import the ReportModal

const QuestionCard = ({
  question,
  onToggleLike,
  onToggleBookmark,
}) => {
  const user = useStore((state) => state.user);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(
    question.commentsCount || 0
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // State for report modal

  const liked = question.likedBy?.some((u) => u.id === user?.id);
  const bookmarked = question.bookmarkedBy?.some((u) => u.id === user?.id);

  // Helper function to convert HTML to formatted text preserving structure
  const htmlToFormattedText = (html) => {
    if (!html) return "";

    const tmpDiv = document.createElement("div");
    tmpDiv.innerHTML = html;

    // Helper to extract all text from an element (recursive)
    const extractText = (element) => {
      if (!element) return "";
      let text = "";
      for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          if (tag === "br") {
            text += "\n";
          } else if (tag !== "ol" && tag !== "ul") {
            // Recursively extract from nested elements (like spans, strong, etc.)
            text += extractText(node);
          }
        }
      }
      return text;
    };

    let result = "";

    // Find all lists first and process them
    const lists = tmpDiv.querySelectorAll("ol, ul");

    if (lists.length > 0) {
      // Process each list
      lists.forEach((list) => {
        const listStyle = list.getAttribute("style") || "";
        const listItems = Array.from(list.children).filter(
          (el) => el.tagName.toLowerCase() === "li"
        );

        listItems.forEach((li, index) => {
          let prefix = "";

          // Determine list type from style attribute
          if (listStyle.includes("lower-roman")) {
            const roman = [
              "i",
              "ii",
              "iii",
              "iv",
              "v",
              "vi",
              "vii",
              "viii",
              "ix",
              "x",
              "xi",
              "xii",
            ];
            prefix = `${roman[index] || index + 1}. `;
          } else if (listStyle.includes("lower-alpha")) {
            prefix = `${String.fromCharCode(97 + index)}. `;
          } else if (listStyle.includes("lower-greek")) {
            const greek = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ"];
            prefix = `${greek[index] || index + 1}. `;
          } else {
            prefix = `${index + 1}. `;
          }

          // Extract text from list item (handles nested elements)
          const itemText = extractText(li).trim();
          if (itemText) {
            result += prefix + itemText + "\n";
          }
        });
      });
    }

    // Also process any non-list content
    for (const node of Array.from(tmpDiv.childNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag !== "ol" && tag !== "ul") {
          // This is not a list, process it
          const text = extractText(node).trim();
          if (text && !result.includes(text)) {
            // Avoid duplicating if already added by list processing
            result += text + "\n";
          }
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) result += text + "\n";
      }
    }

    return result.trim() || tmpDiv.innerText?.trim() || "";
  };

  // Solve with ChatGPT button
  const handleSolveWithChatGPT = () => {
    // Capture current question data immediately
    const currentQuestionText = question?.text;
    const currentQuestionImage = question?.image;
    const currentQuestionOptions = question?.options;

    if (!currentQuestionText) {
      toast.error("Question data not available");
      return;
    }

    // Convert HTML to formatted text preserving structure
    let questionText = htmlToFormattedText(currentQuestionText);

    // Fallback if conversion failed
    if (!questionText || questionText.length < 3) {
      const tmpDiv = document.createElement("div");
      tmpDiv.innerHTML = currentQuestionText || "";
      questionText =
        tmpDiv.innerText?.trim() || tmpDiv.textContent?.trim() || "";
    }

    // Build formatted question text with options and image
    let formattedQuestion = questionText;

    // Add options if they exist
    if (
      currentQuestionOptions &&
      Array.isArray(currentQuestionOptions) &&
      currentQuestionOptions.length > 0
    ) {
      const optionsText = currentQuestionOptions
        .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
        .join("\n");
      formattedQuestion += `\n\nOptions:\n${optionsText}`;
    }

    // Add image URL if present
    if (currentQuestionImage) {
      formattedQuestion += `\n\n[Image: ${currentQuestionImage}]`;
    }

    // Build the complete prompt with question included
    const fullPrompt = `Act as an expert instructor in the subject area.

Explain concepts clearly and provide a **step-by-step solution** to the problem. Break down each step so a student can follow along easily. Include reasoning, formulas, and examples where necessary. Avoid assuming prior knowledge beyond basic prerequisites.

Use clear formatting with numbered steps, bullet points, or code blocks where relevant. Highlight important notes or tips that help understanding.

At the end, please solve the following problem:

: ${formattedQuestion}`;

    // Copy the complete prompt (with question) to clipboard
    navigator.clipboard
      .writeText(fullPrompt)
      .then(() => {
        toast.success("Ready to paste! Opening ChatGPT...", {
          duration: 3000,
        });

        // Open ChatGPT
        setTimeout(() => {
          const timestamp = Date.now();
          window.open(
            `https://chatgpt.com/?t=${timestamp}`,
            "_blank",
            "noopener,noreferrer"
          );
        }, 300);
      })
      .catch(() => {
        toast.error("Failed to copy. Please try again.", {
          duration: 3000,
        });
      });
  };

  // ✅ FIXED Share & Copy Link handlers
  const handleShare = async () => {
    const url = `${window.location.origin}/questions/${question.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this question",
          text: "Here's an interesting question from StudyLabz:",
          url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      toast.error("Sharing is not supported on this device.");
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/questions/${question.id}`;
    try {
      await navigator.clipboard.writeText(url); // plain text only
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleOpenReportModal = () => {
    if (!user) {
      toast.error("You need to be logged in to report a question.");
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleReportSuccess = () => {
    // Optionally, you can add some logic here after a report is successfully submitted
    // e.g., disable the report button for this question for the current user
  };

  return (
    <div className=" bg-sf-gradient border-theme shadow-lg rounded-xl max-w-2xl mx-auto mb-6 overflow-hidden transition hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-sm">
          <span className="font-semibold text-theme">
            Author: {question.creatorName || "Unknown User"}
          </span>
          <span className="text-gray-500 text-xs sm:text-sm">
            Created at: {new Date(question.createdAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2 mt-1 sm:mt-0">
            <span className="px-3 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {question.examType || "No Exam Type"}
            </span>

            <span className="px-3 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {question.marks} Marks
            </span>
          </div>
        </div>

        <Tippy content="Report this question" placement="bottom">
          <button
            onClick={handleOpenReportModal} // Use the new handler
            className="text-gray-400 hover:text-red-500 transition cursor-pointer"
          >
            <Flag size={20} />
          </button>
        </Tippy>
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 flex flex-col gap-4">
        <div
          className="text-gray-900 font-medium text-sm sm:text-base leading-relaxed wrap-break-word jodit-wysiwyg"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(question.text || ""),
          }}
        />

        {question.image && (
          <img
            src={question.image}
            alt="Question"
            className="my-4 rounded-lg max-w-full object-contain max-h-100"
          />
        )}

        {question.options?.length > 0 && (
          <ul className="list-disc list-inside text-gray-600 text-sm sm:text-base space-y-1">
            {question.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        )}

        <div className="border-t border-gray-200 my-3" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tippy content="Like" placement="bottom">
              <button
                onClick={onToggleLike}
                className={`flex items-center gap-2 text-2xl transition cursor-pointer ${
                  liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart fill={liked ? "red" : "none"} size={23} />
                <span className="text-base">
                  {question.likedBy?.length || 0}
                </span>
              </button>
            </Tippy>

            <Tippy content="Comments" placement="bottom">
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className="flex items-center gap-2 text-2xl text-gray-500 hover:text-blue-500 transition cursor-pointer"
              >
                <MessageCircle size={23} />
                <span className="text-base">{commentsCount}</span>
              </button>
            </Tippy>

            {/* ✅ Separate Share and Copy buttons */}
            <Tippy content="Share question" placement="bottom">
              <button
                onClick={handleShare}
                className="flex items-center text-2xl text-gray-500 hover:text-green-500 transition cursor-pointer"
              >
                <Send size={23} />
              </button>
            </Tippy>

            <Tippy content="Copy link" placement="bottom">
              <button
                onClick={handleCopyLink}
                className="flex items-center text-2xl text-gray-500 hover:text-amber-500 transition cursor-pointer"
              >
                <Link2 size={23} />
              </button>
            </Tippy>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Tippy content="Solve with ChatGPT" placement="bottom">
              <button
                onClick={handleSolveWithChatGPT}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-white bg-linear-to-r from-purple-500 to-pink-500 rounded-md hover:from-purple-600 hover:to-pink-600 transition shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
              >
                <IconBrandOpenai size={20} />
                Solve with ChatGPT
              </button>
            </Tippy>

            <Tippy content="Bookmark" placement="bottom">
              <button
                onClick={onToggleBookmark}
                className={`flex items-center gap-2 text-2xl transition cursor-pointer ${
                  bookmarked
                    ? "text-blue-500"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <Bookmark fill={bookmarked ? "blue" : "none"} size={23} />
                <span className="text-base">
                  {question.bookmarkedBy?.length || 0}
                </span>
              </button>
            </Tippy>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <CommentsSection
              questionId={question.id}
              questionCreatorId={question.studentId}
              onNewComment={() => setCommentsCount((prev) => prev + 1)}
            />
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        onReportSuccess={handleReportSuccess}
        questionId={question.id}
      />
    </div>
  );
};

export default QuestionCard;
