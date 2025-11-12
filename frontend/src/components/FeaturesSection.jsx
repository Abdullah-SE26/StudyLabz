import React from "react";
import {
  Upload,
  BookOpen,
  MessageCircle,
  Bookmark,
  Cpu,
  FilePlus2,
  Sparkles,
} from "lucide-react";

const featuresData = [
  {
    title: "Upload Questions",
    subtitle: "Share your past exams",
    icon: (
      <Upload className="w-12 h-12 text-sf-green mb-4 transition-transform duration-300 group-hover:scale-110" />
    ),
    content:
      "Add your own exam questions - MCQs or essays - to help others prepare and keep the question bank growing.",
  },
  {
    title: "Browse & Practice",
    subtitle: "Find what matters",
    icon: (
      <BookOpen className="w-12 h-12 text-sf-green mb-4 transition-transform duration-300 group-hover:scale-110" />
    ),
    content:
      "Explore a massive library of student-uploaded questions, organized by courses, exams and majors.",
  },
  {
    title: "Discuss with Peers",
    subtitle: "Collaborate & learn",
    icon: (
      <MessageCircle className="w-12 h-12 text-sf-green mb-4 transition-transform duration-300 group-hover:scale-110" />
    ),
    content:
      "Comment on questions, exchange ideas, and learn together - just like a digital study group.",
  },
  {
    title: "Bookmark for Revision",
    subtitle: "Save key questions",
    icon: (
      <Bookmark className="w-12 h-12 text-sf-green mb-4 transition-transform duration-300 group-hover:scale-110" />
    ),
    content:
      "Keep track of important or tricky questions by bookmarking them for quick access during revision.",
  },
  {
    title: "Solve with AI",
    subtitle: "Guided hints & help",
    icon: (
      <Cpu className="w-12 h-12 text-sf-green mb-4 transition-transform duration-300 group-hover:scale-110" />
    ),
    content:
      "Use AI to understand tough questions with step-by-step hints and logical explanations.",
  },
  {
    title: "Generate Sample Exams",
    subtitle: "AI-powered mock tests",
    icon: (
      <FilePlus2 className="w-12 h-12 text-sf-green mb-4 transition-transform duration-300 group-hover:scale-110" />
    ),
    content:
      "Generate mock exams using AI based on courses and exam types to simulate real test scenarios.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-sf-cream">
      <h1 className="text-4xl font-bold text-center mb-12 flex justify-center items-center gap-2 text-sf-green">
        Features <Sparkles color="#FFD700" strokeWidth={1.5} />
      </h1>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-sf-green/30 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-sf-green mb-1">
              {feature.title}
            </h3>
            <p className="text-slate-500 text-sm mb-2">{feature.subtitle}</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {feature.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
