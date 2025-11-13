import { useLocation } from "react-router-dom";

export default function VerifyRequestPage() {
  const location = useLocation();
  const userEmail = location.state?.userEmail || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-sf-light px-4">
      <div className="bg-white/90 shadow-lg rounded-xl p-8 max-w-md w-full text-center backdrop-blur-sm">

        {/* Placeholder icon at top center */}
        <div className="flex justify-center mb-4">
          <span className="text-5xl">📬</span>
        </div>

        <h2 className="text-2xl font-bold text-sf-text mb-4">
          Check Your Email
        </h2>

        <p className="text-sf-text/80 mb-6">
          A login link has been sent to <strong>{userEmail}</strong>.<br />
          Click the button below to open your Gmail inbox.
        </p>

        <a
          href="https://mail.google.com/mail/u/0/#inbox"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-sf-green hover:bg-sf-green-hover text-white rounded-lg font-medium transition mb-4"
        >
          Open Gmail Inbox
        </a>

        <p className="text-sf-text/50 text-sm">
          If you don’t see the email, check your Spam or All Mail folder.
        </p>
      </div>
    </div>
  );
}
