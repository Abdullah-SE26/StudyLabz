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
    image: "Saif.jpg",
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
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-8 rounded-2xl cursor-pointer
        bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2 
        hover:bg-linear-to-br hover:from-blue-50 hover:to-blue-100"
            >
              <div className="p-4 rounded-xl  text-white shadow-md mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>

        <div className="flex flex-wrap justify-center gap-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center p-6 w-44 sm:w-52 rounded-2xl bg-white/70 backdrop-blur-sm 
        shadow-md hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer"
            >
              {/* Tooltip wraps image */}
              <AnimatedTooltip
                items={[
                  { id: member.id, name: member.name, image: member.image },
                ]}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-3 object-cover border-4 border-white shadow-md transition-transform hover:scale-105"
                />
              </AnimatedTooltip>

              <div className="flex mt-3 space-x-5">
                <Tippy
                  content="Send Email"
                  placement="bottom"
                  arrow
                  animation="scale-extreme"
                >
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${member.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    <IconMail size={22} />
                  </a>
                </Tippy>
                <Tippy
                  content="GitHub Profile"
                  placement="bottom"
                  arrow
                  animation="scale-extreme"
                >
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    <IconBrandGithub size={22} />
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
