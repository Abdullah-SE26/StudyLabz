"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, User, Send } from "lucide-react";
import { IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "../../lib/axios";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    subject: "General Inquiry",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Sending message...");

    try {
      await axios.post("/contact", formData);
      toast.dismiss(toastId);
      toast.success("Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
        subject: "General Inquiry/Feedback",
      });
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
      toast.error(err?.response?.data?.message || "Error sending message");
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    "General Inquiry/Feedback",
    "Technical Support",
    "Request Course",
  ];

  return (
    <div className="flex justify-center items-center py-10 px-4 min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="relative shadow-2xl rounded-3xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Side - Contact Info */}
        <div className="relative bg-[url('https://res.cloudinary.com/dhqyjs4tk/image/upload/f_auto,q_auto/v1763239289/contact-bg_dtkzcw.jpg')] bg-cover bg-center text-white p-8 flex flex-col justify-between rounded-l-3xl">
          <div className="absolute inset-0 bg-black/50 rounded-l-3xl"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Contact Us</h2>
            <p className="mb-6 text-blue-100 text-sm sm:text-base">
              Have questions, feedback, or course requests? Reach out and we’ll
              get back to you!
            </p>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>studylabz2025@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Al Ain University of Science and Technology</span>
              </li>
            </ul>
          </div>
          <div className="relative z-10 flex gap-4 mt-6 justify-center">
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandLinkedin size={24} />
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandGithub size={24} />
            </a>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-10 relative bg-card-background rounded-r-3xl">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">
            Send us a Message
          </h3>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Fill out the form below and we will respond as quickly as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="w-5 h-5 absolute top-3 left-2 text-indigo-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 rounded-md bg-transparent focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <User className="w-5 h-5 absolute top-3 left-2 text-indigo-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 rounded-md bg-transparent focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="w-5 h-5 absolute top-3 left-2 text-indigo-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone No."
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 rounded-md bg-transparent focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Mail className="w-5 h-5 absolute top-3 left-2 text-indigo-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 rounded-md bg-transparent focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Message */}
            <div className="relative">
              <Mail className="w-5 h-5 absolute top-3 left-2 text-indigo-400" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows="4"
                className="w-full border-b-2 border-gray-300 p-2 pl-10 rounded-md bg-transparent focus:outline-none focus:border-indigo-500 transition resize-none"
                disabled={loading}
              />
            </div>

            {/* Subject */}
            <div>
              <p className="font-semibold mb-2 text-gray-700">Select Subject</p>
              <div className="flex flex-wrap gap-6">
                {subjects.map((sub) => (
                  <label
                    key={sub}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <input
                      type="radio"
                      name="subject"
                      value={sub}
                      checked={formData.subject === sub}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform font-semibold shadow-lg w-full"
            >
              <Send className="w-5 h-5" />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
