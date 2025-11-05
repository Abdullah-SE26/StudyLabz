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
      await axios.post("/api/contact", formData);
      toast.dismiss(toastId);
      toast.success("Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
        subject: "General Inquiry",
      });
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
      toast.error(err?.response?.data?.message || "Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 min-h-screen ">
      <Toaster />
      <div className="relative shadow-2xl rounded-3xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Owl Image Overlay */}
        <img
          src="/scientist_owl_512.png"
          alt="Mascot"
          className="absolute -top-10 -right-10 w-32 h-32 opacity-20 rotate-12 pointer-events-none"
        />

        {/* Left Side - Contact Info */}
        <div className="relative bg-[url('/contact-bg.jpg')] bg-cover bg-center text-white p-10 flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
            <p className="mb-8 text-blue-100">Have a big idea or any inquiries? Get in touch!</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <span>studylabz2025@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                <span>Al Ain University of Science and Technology</span>
              </li>
            </ul>
          </div>
          <div className="relative z-10 flex gap-4 mt-8">
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandLinkedin size={28} />
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandGithub size={28} />
            </a>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-10 relative">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h3>
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
              <div className="flex gap-6">
                {["General Inquiry", "Technical Support", "Website Feedback"].map((sub) => (
                  <label key={sub} className="flex items-center gap-2 text-gray-600">
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
              className="cursor-pointer flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform font-semibold shadow-lg"
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
