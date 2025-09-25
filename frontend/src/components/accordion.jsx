import React, { useState } from "react";
import { Upload, BookOpen, Heart, MessageCircle } from "lucide-react";

const accordionData = [
  {
    title: "Upload Your Questions",
    subtitle: "Add MCQs or essay questions from past exams",
    icon: <Upload className="w-8 h-8 mr-4 shrink-0 text-slate-800" />,
    content: `Students can upload questions (MCQs or essays) from previous exams to contribute to our community database. 
    Make sure questions are clear and well-formatted so others can learn effectively.`,
  },
  {
    title: "Browse Previous Exams",
    subtitle: "Explore questions uploaded by other students",
    icon: <BookOpen className="w-8 h-8 mr-4 shrink-0 text-slate-800" />,
    content: `Access a wide collection of past exam questions. Filter by subject, course, or exam year to quickly find what you need. 
    Perfect for exam preparation and practice.`,
  },
  {
    title: "Interact with Questions",
    subtitle: "Like, bookmark, or report questions",
    icon: <Heart className="w-8 h-8 mr-4 shrink-0 text-slate-800" />,
    content: `You can like questions that are useful, bookmark them for later, or report any inappropriate content. 
    This helps maintain quality and relevance in the StudyLabz community.`,
  },
  {
    title: "Discuss & Comment",
    subtitle: "Engage with other students",
    icon: <MessageCircle className="w-8 h-8 mr-4 shrink-0 text-slate-800" />,
    content: `Each question has a comment section where students can discuss tricky problems, 
    share hints, or link helpful video resources. Collaboration is key!`,
  },
];

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-4 bg-white">
      <div className="space-y-4 max-w-7xl mx-auto mt-4 px-6 sm:px-8">
        {accordionData.map((item, index) => {
          const isOpen = openIndex === index;
          const borderColor = isOpen ? "border-blue-500" : "border-slate-300";
          const textColor = isOpen ? "text-blue-500" : "text-slate-900";

          return (
            <div
              key={index}
              className={`rounded-lg border-l-8 ${borderColor} hover:bg-blue-50 shadow-[0_2px_10px_-3px_rgba(14,14,14,0.2)] transition-transform duration-150 ease-out hover:scale-[1.02] hover:shadow-md cursor-pointer`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center py-5 px-6">
                {item.icon}
                <span className={`mr-4 ${textColor}`}>
                  {item.title}
                  <span className="text-xs text-slate-600 mt-0.5 block font-normal">
                    {item.subtitle}
                  </span>
                </span>
                <svg
                  className={`w-[14px] h-[14px] ml-auto shrink-0 transition-transform duration-200 ease-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <div
                className="overflow-hidden transition-all duration-200 ease-out"
                style={{ maxHeight: isOpen ? "1000px" : "0px" }}
              >
                <div className="pb-5 px-6 text-sm text-slate-600 leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
