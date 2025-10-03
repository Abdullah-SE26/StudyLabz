import React from "react";
import { Upload, BookOpen, Heart, MessageCircle, Sparkles, Bookmark, Cpu } from "lucide-react";

const featuresData = [
  {
    title: "Upload Questions",
    subtitle: "Add MCQs or essays",
    icon: <Upload className="w-12 h-12 text-slate-800 mb-4 transition-transform duration-300 group-hover:scale-110" />,
    content: "Contribute your past exam questions to help others practice effectively.",
  },
  {
    title: "Browse Exams",
    subtitle: "Explore student uploads",
    icon: <BookOpen className="w-12 h-12 text-slate-800 mb-4 transition-transform duration-300 group-hover:scale-110" />,
    content: "Filter by subject or year and access a wide collection of past questions.",
  },
  {
    title: "Interact",
    subtitle: "Like, bookmark, report",
    icon: <Heart className="w-12 h-12 text-slate-800 mb-4 transition-transform duration-300 group-hover:scale-110" />,
    content: "Engage with questions to maintain quality and relevance in the community.",
  },
  {
    title: "Discuss & Comment",
    subtitle: "Engage with peers",
    icon: <MessageCircle className="w-12 h-12 text-slate-800 mb-4 transition-transform duration-300 group-hover:scale-110" />,
    content: "Collaborate with other students through comments and discussions.",
  },
  {
    title: "Bookmark Questions",
    subtitle: "Save for later",
    icon: <Bookmark className="w-12 h-12 text-slate-800 mb-4 transition-transform duration-300 group-hover:scale-110" />,
    content: "Keep track of important questions by bookmarking them for later review.",
  },
  {
    title: "Solve with ChatGPT",
    subtitle: "AI-assisted solutions",
    icon: <Cpu className="w-12 h-12 text-slate-800 mb-4 transition-transform duration-300 group-hover:scale-110" />,
    content: "Use AI to get hints or solutions for challenging questions.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <h1 className="text-4xl font-bold text-center mb-12 flex justify-center items-center gap-2">
        Features <Sparkles color="#0a95ff" strokeWidth={1.5} />
      </h1>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className="group flex flex-col items-center text-center p-6 rounded-xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-xl bg-gradient-to-br from-white to-white hover:from-blue-50 hover:to-blue-100"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-blue-500 mb-2">{feature.title}</h3>
            <p className="text-slate-600 text-sm">{feature.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
