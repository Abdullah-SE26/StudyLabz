import { useEffect, useState } from "react";
import axios from "../../lib/axios";

export default function AIDrawer({ open, onClose, question }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // when opening drawer, fetch first solution
  useEffect(() => {
    if (open) {
      fetchInitialAnswer();
    } else {
      setMessages([]);
    }
  }, [open]);

  const fetchInitialAnswer = async () => {
    setLoading(true);
    const res = await axios.post("/api/ai/solve", {
      question: question,
    });

    setMessages([
      { role: "assistant", text: res.data.answer }
    ]);

    setLoading(false);
  };

  const sendFollowUp = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const res = await axios.post("/api/ai/followup", {
      originalQuestion: question,
      message: userMessage,
      context: messages
    });

    const aiText = res.data.answer;

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: aiText }
    ]);

    setLoading(false);
  };

  return (
    <div className={`drawer drawer-end ${open ? "drawer-open" : ""}`}>
      <input id="ai-drawer" type="checkbox" className="drawer-toggle" checked />

      <div className="drawer-side">
        <div className="menu bg-base-100 w-96 min-h-full p-4 flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Solve with AI</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle">
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <div className="alert alert-info">
              <span><strong>Question:</strong> {question}</span>
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat ${m.role === "user" ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-bubble">
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat chat-start">
                <div className="chat-bubble opacity-50">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Ask a follow-up..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendFollowUp()}
            />
            <button className="btn btn-primary" onClick={sendFollowUp}>
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
