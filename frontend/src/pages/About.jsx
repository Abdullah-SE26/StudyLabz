import React, { Suspense } from "react";
import { IconBrandGithub, IconMail } from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ResponsiveOptimizedImage from "../components/ResponsiveOptimizedImage";

// Lazy-load FeaturesSection
const FeaturesSection = React.lazy(() => import("../components/FeaturesSection"));

// Team members
const teamMembers = [
  {
    id: 1,
    name: "MUHAMMAD ABDULLAH",
    image: "Abdullah_kas8ys",
    email: "202120030@aau.ac.ae",
    github: "https://github.com/Abdullah-SE26",
  },
  {
    id: 2,
    name: "YASSIN BROMEO",
    image: "Yassin_jkmycj",
    email: "202120043@aau.ac.ae",
    github: "https://github.com/Yassin-101",
  },
  {
    id: 3,
    name: "SAIF ALKAABI",
    image: "Saif_h7ss3g",
    email: "202211659@aau.ac.ae",
    github: "https://github.com/saifAlkaabi1",
  },
  {
    id: 4,
    name: "MOHAMMAD QASAYMEH",
    image: "Qasaymeh_thhat4",
    email: "202110427@aau.ac.ae",
    github: "https://github.com/mohammadqasaymeh03",
  },
];

export default function AboutPage() {
  return (
    <section className="bg-background text-foreground">
      {/* Project Intro */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 flex justify-center items-center gap-2">
          About StudyLabz
        </h1>
        <p className="text-lg text-muted-foreground">
          StudyLabz is a web platform designed to help university students
          access, practice, and collaborate on questions, quizzes, and past exam
          papers. It’s a central hub to study smarter, prepare for exams, and
          engage with the student community.
        </p>
      </div>

      {/* Features Section */}
      <Suspense fallback={<div className="text-center py-10">Loading features...</div>}>
        <FeaturesSection />
      </Suspense>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center p-6 w-44 sm:w-52 rounded-2xl bg-card-background shadow-md
                hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer will-change-transform"
            >
              {/* Tooltip on top of image */}
              <Tippy content={member.name} placement="top" animation="fade" delay={[100, 0]}>
                <div>
                  <ResponsiveOptimizedImage
                    publicId={member.image}
                    alt={member.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-3 object-cover border-4 border-card-border shadow-md transition-transform hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </Tippy>

              {/* Contact Icons */}
              <div className="flex mt-3 space-x-5">
                <Tippy content="Send Email" placement="top" animation="fade">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${member.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    <IconMail size={22} />
                  </a>
                </Tippy>
                <Tippy content="GitHub Profile" placement="bottom" animation="fade">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition"
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
