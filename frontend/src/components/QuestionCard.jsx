import React, { useState } from "react";
import DOMPurify from "dompurify";
import { Heart, Bookmark, MessageCircle, Send, Flag } from "lucide-react";
import { IconBrandOpenai } from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import toast from "react-hot-toast";
import CommentsSection from "./CommentsSection";
import { useStore } from "../store/authStore";

const QuestionCard = ({
  question,
  onToggleLike,
  onToggleBookmark,
  onReport,
}) => {
  const user = useStore((state) => state.user);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(
    question.commentsCount || 0
  );

  const liked = question.likedBy?.some((u) => u.id === user?.id);
  const bookmarked = question.bookmarkedBy?.some((u) => u.id === user?.id);

  const handleSolveWithChatGPT = async () => {
    const html = question.text || "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    const plain = doc.body.innerText?.trim() || "";

    let prompt = `Solve this question step by step and explain the reasoning in detail. Show calculations or logic clearly.\n\nQuestion:\n${plain}`;

    if (question.options?.length > 0) {
      prompt += `\n\nOptions:\n${question.options
        .map((opt, i) => `${i + 1}. ${opt}`)
        .join("\n")}`;
    }

    const encoded = encodeURIComponent(prompt);
    const MAX_SAFE_LENGTH = 1800;

    try {
      if (encoded.length <= MAX_SAFE_LENGTH) {
        const url = `https://chat.openai.com/?q=${encoded}`;
        window.open(url, "_blank");
      } else {
        await navigator.clipboard.writeText(prompt);
        window.open("https://chat.openai.com/chat", "_blank");
        toast.success("Prompt copied — paste it in ChatGPT to start solving!");
      }
    } catch {
      window.open("https://chat.openai.com/chat", "_blank");
      toast.error("Couldn't copy the prompt. Please paste manually.");
    }
  };

  return (
    <div className="bg-theme border-theme shadow-lg rounded-xl max-w-2xl mx-auto mb-6 overflow-hidden transition hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-sm">
          {/* Created by with studentId */}
          <span className="font-semibold text-theme">
            Author: {question.creatorName || "Unknown User"}
          </span>
          <div className="flex gap-2 mt-1 sm:mt-0">
            <span className="px-3 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {question.exam?.title || "No Exam"}
            </span>
            <span className="px-3 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              {question.marks} Marks
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Tippy content="Report this question" placement="bottom">
            <button
              onClick={onReport}
              className="text-gray-400 hover:text-red-500 transition cursor-pointer"
            >
              <Flag size={20} />
            </button>
          </Tippy>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 flex flex-col gap-4">
        <div
          className="text-gray-900 font-medium text-sm sm:text-base leading-relaxed break-words jodit-wysiwyg"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(question.text || ""),
          }}
        />

        {/* Question Image */}
        {question.image && (
          <img
            src={question.image}
            alt="Question"
            className="my-4 rounded-lg max-w-full object-contain"
          />
        )}

        {/* MCQ Options */}
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

            <Tippy content="Share question" placement="bottom">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/questions/${question.id}`;
                  if (navigator.share)
                    navigator
                      .share({ title: "Check out this question", url })
                      .catch(console.error);
                  else navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard!");
                }}
                className="flex items-center text-2xl text-gray-500 hover:text-green-500 transition cursor-pointer"
              >
                <Send size={23} />
              </button>
            </Tippy>

            <Tippy content="Solve with ChatGPT" placement="bottom">
              <button
                onClick={handleSolveWithChatGPT}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-purple-100 hover:text-purple-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <IconBrandOpenai size={20} />
                Solve with ChatGPT
              </button>
            </Tippy>
          </div>

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

        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <CommentsSection
              questionId={question.id}
              onNewComment={() => setCommentsCount((prev) => prev + 1)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
