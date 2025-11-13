import { AnimatedTooltip } from "../components/ui/animated-tooltip";
import FeaturesSection from "../components/FeaturesSection";
import { IconBrandGithub, IconMail } from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale-extreme.css";


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

      {/* Features Section (uses your existing component + theme) */}
      <FeaturesSection />

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center p-6 w-44 sm:w-52 rounded-2xl bg-card-background shadow-md
              hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer"
            >
              <AnimatedTooltip
                items={[
                  { id: member.id, name: member.name, image: member.image },
                ]}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-3 object-cover border-4 border-card-border shadow-md transition-transform hover:scale-105"
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
                    className="text-muted-foreground hover:text-primary transition"
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
