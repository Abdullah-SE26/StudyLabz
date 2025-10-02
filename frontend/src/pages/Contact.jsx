"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, User, Send } from "lucide-react";
import { IconBrandLinkedin, IconBrandInstagram,IconBrandGithub } from "@tabler/icons-react";
import toast, { Toaster } from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    subject: "General Inquiry",
  });

  const backendURL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Sending message...");

    try {
      const res = await fetch(`${backendURL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.dismiss();
        toast.success("Message sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          message: "",
          subject: "General Inquiry",
        });
      } else {
        toast.dismiss();
        toast.error("Failed to send message.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Error sending message.");
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <Toaster/>
      <div className="relative bg-white shadow-2xl rounded-3xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Owl Image */}
        <img
          src="/scientist_owl_512.png"
          alt="Mascot"
          className="absolute top-[-40px] right-[-40px] w-32 h-32 opacity-20 rotate-12 pointer-events-none"
        />

        {/* Left Side - Contact Info */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
            <p className="mb-8 text-blue-100">
              Have a big idea or any inquiries? Get in touch!
            </p>
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

          <div className="flex gap-4 mt-8">
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandLinkedin size={28} />
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandInstagram size={28} />
            </a>
            <a href="#" className="hover:text-yellow-300 transition">
              <IconBrandGithub size={28} />
            </a>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 focus:outline-none focus:border-indigo-500 transition"
                />
                <User className="w-5 h-5 absolute top-3 left-2 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 focus:outline-none focus:border-indigo-500 transition"
                />
                <User className="w-5 h-5 absolute top-3 left-2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone No."
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 focus:outline-none focus:border-indigo-500 transition"
                />
                <Phone className="w-5 h-5 absolute top-3 left-2 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border-b-2 border-gray-300 p-2 pl-10 focus:outline-none focus:border-indigo-500 transition"
                />
                <Mail className="w-5 h-5 absolute top-3 left-2 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows="4"
                className="w-full border-b-2 border-gray-300 p-2 pl-10 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
              <Mail className="w-5 h-5 absolute top-3 left-2 text-gray-400" />
            </div>

            <div>
              <p className="font-semibold mb-2">Select Subject</p>
              <div className="flex gap-6">
                {["General Inquiry", "Technical Support", "Website Feedback"].map((sub) => (
                  <label key={sub} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="subject"
                      value={sub}
                      checked={formData.subject === sub}
                      onChange={handleChange}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition font-semibold shadow-lg cursor-pointe"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
