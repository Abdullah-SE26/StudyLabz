"use client";

import { AnimatedTooltip } from "../components/ui/animated-tooltip";
import {
  Sparkles,
  BookOpen,
  Heart,
  MessageCircle,
  Upload,
  Cpu,
} from "lucide-react";
import { IconBrandGithub, IconMail } from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale-extreme.css";

// Features data
const featuresData = [
  {
    title: "Upload Questions",
    description: "Contribute past exam questions for others to practice.",
    icon: <Upload className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Browse Exams",
    description: "Filter by subject, course, or year to find what you need.",
    icon: <BookOpen className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Interact",
    description: "Like, bookmark, or report questions to maintain quality.",
    icon: <Heart className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Discuss & Comment",
    description: "Collaborate with other students in the comment section.",
    icon: <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Bookmark Questions",
    description: "Save important questions to revisit later.",
    icon: <BookOpen className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    title: "Solve with ChatGPT",
    description: "Get AI-assisted hints and solutions for tricky questions.",
    icon: <Cpu className="w-8 h-8 text-blue-500 mb-2" />,
  },
];

// Team members
const teamMembers = [
  {
    id: 1,
    name: "MUHAMMAD ABDULLAH",
    image: "/Abdullah.jpg",
    email: "202120030@aau.ac.ae",
    github: "https://github.com/Abdullah-SE26",
  },
  {
    id: 2,
    name: "YASSIN BROMEO",
    image: "/Yassin.jpg",
    email: "202120043@aau.ac.ae",
    github: "https://github.com/Yassin-101",
  },
  {
    id: 3,
    name: "SAIF ALKAABI",
    image: "image3.jpg",
    email: "202211659@aau.ac.ae",
    github: "https://github.com/saifAlkaabi1",
  },
  {
    id: 4,
    name: "MOHAMMAD QASAYMEH",
    image: "Qasaymeh.jpg",
    email: "202110427@aau.ac.ae",
    github: "https://github.com/mohammadqasaymeh03",
  },
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
          StudyLabz is a web platform designed to help university students
          access, practice, and collaborate on questions, quizzes, and past exam
          papers. It’s a central hub to study smarter, prepare for exams, and
          engage with the student community.
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
              <h3 className="text-xl font-semibold text-blue-500 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>

        <div className="flex flex-wrap justify-center gap-8 mb-5">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center bg-blue-50 p-15 w-40 sm:w-48 md:w-52 lg:w-56 rounded-xl cursor-pointer hover:shadow-lg transition"
            >
              {/* Tooltip wraps image */}
              <AnimatedTooltip
                items={[{ id: member.id, name: member.name, image: member.image }]}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full mb-2 object-contain mx-auto transition-transform transform hover:scale-105"
                />
              </AnimatedTooltip>

              <div className="flex mt-2 space-x-4">
                <Tippy
                  content="Send Email"
                  placement="bottom"
                  arrow={true}
                  animation="scale-extreme"
                >
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${member.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-blue-500 transition"
                  >
                    <IconMail size={25} />
                  </a>
                </Tippy>

                <Tippy
                  content="GitHub Profile"
                  placement="bottom"
                  arrow={true}
                  animation="scale-extreme"
                >
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-blue-500 transition"
                  >
                    <IconBrandGithub size={25} />
                  </a>
                </Tippy>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
