"use client";
import React from "react";
import { useLocation } from "react-router-dom";

export default function VerifyRequestPage() {
  const location = useLocation();
  const userEmail = location.state?.userEmail || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 max-w-md w-full text-center">
        {/* Placeholder icon at top center */}
        <div className="flex justify-center mb-4">
          <span className="text-5xl">📬</span>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Check Your Email
        </h2>

        <p className="text-gray-700 dark:text-gray-200 mb-6">
          A login link has been sent to <strong>{userEmail}</strong>. 
          Click the button below to open your Gmail inbox.
        </p>

        <a
          href="https://mail.google.com/mail/u/0/#inbox"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition mb-4"
        >
          Open Gmail Inbox
        </a>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          If you don’t see the email, check your Spam or All Mail folder.
        </p>
      </div>
    </div>
  );
}
