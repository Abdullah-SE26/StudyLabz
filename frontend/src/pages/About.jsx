"use client";

import React from "react";
import { Tooltip } from "@aceternity/externity-ui";
import { Sparkles, BookOpen, Heart, MessageCircle, Upload, Cpu } from "lucide-react";

const featuresData = [
  {
    title: "Upload Questions",
    icon: <Upload className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Browse Exams",
    icon: <BookOpen className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Interact",
    icon: <Heart className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Discuss & Comment",
    icon: <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Bookmark Questions",
    icon: <BookOpen className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Solve with ChatGPT",
    icon: <Cpu className="w-8 h-8 text-blue-500 mb-2" />,
  },
];

const teamMembers = [
  { name: "MUHAMMAD ABDULLAH", image: "image1.jpg" },
  { name: "YASIN BROMEW", image: "image2.jpg" },
  { name: "SAIF ALKABI", image: "image3.jpg" },
  { name: "MOHAMMAD QASAYMAH", image: "image4.jpg" },
];

export default function AboutPage() {
  return (
    <section className="bg-white text-slate-900">
      {/* Project Intro */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 flex justify-center items-center gap-2">
          About StudyLabz <Sparkles color="#0a95ff" strokeWidth={1.5} />
        </h1>
        <p className="text-lg text-slate-700">
          StudyLabz is a web platform designed to help university students access, practice, and collaborate
          on questions, quizzes, and past exam papers. It’s a central hub to study smarter, prepare for exams,
          and engage with the student community.
        </p>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-6 rounded-xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-lg hover:bg-blue-50"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold text-blue-500">{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 justify-items-center">
          {teamMembers.map((member, index) => (
            <Tooltip
              key={index}
              content={
                <div className="flex flex-col items-center p-2">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-16 h-16 rounded-full mb-2 object-cover"
                  />
                  <span className="text-sm font-semibold text-slate-900">{member.name}</span>
                </div>
              }
              animated
              placement="top"
            >
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                {/* Placeholder for profile image */}
                <span className="text-slate-500 font-bold">{member.name.split(" ")[0][0]}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </section>
  );
}
