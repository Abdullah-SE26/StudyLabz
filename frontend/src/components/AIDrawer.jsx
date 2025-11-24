import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

export default function AIDrawer({ open, onClose, question }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchInitialAnswer = useCallback(async () => {
    if (!question) return;

    setLoading(true);
    try {
      const res = await axios.post("/ai/solve", {
        question: question,
      });

      setMessages([{ role: "assistant", text: res.data.answer }]);
    } catch (err) {
      console.error("AI solve error:", err);
      toast.error("Failed to get AI solution. Please try again.");
      setMessages([
        {
          role: "assistant",
          text: "Sorry, I couldn't generate a solution. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [question]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // when opening drawer, fetch first solution
  useEffect(() => {
    if (open && question) {
      setMessages([]);
      fetchInitialAnswer();
    } else if (!open) {
      setMessages([]);
      setInput("");
    }
  }, [open, question, fetchInitialAnswer]);

  const sendFollowUp = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const currentMessages = messages;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/ai/followup", {
        originalQuestion: question,
        message: userMessage,
        context: currentMessages,
      });

      const aiText = res.data.answer;
      const isBlocked = res.data.blocked;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: aiText, blocked: isBlocked },
      ]);
    } catch (err) {
      console.error("AI follow-up error:", err);
      toast.error("Failed to send message. Please try again.");
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full z-50 transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "420px" }}
    >
      {/* Drawer */}
      <div className="h-full w-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100">
              Solve with AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close drawer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Question Display */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">
              QUESTION
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {question}
            </div>
          </div>

          {/* Messages */}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                  m.role === "user"
                    ? "bg-purple-600 text-white"
                    : m.blocked
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              placeholder="Ask a follow-up question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendFollowUp()
              }
              disabled={loading}
            />
            <button
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              onClick={sendFollowUp}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
