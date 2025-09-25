
import { IconBrandGithubFilled } from "@tabler/icons-react"; 

const creators = [
  { name: "Muhammad Abdullah", email: "m.abdullahx21@gmail.com" },
  { name: "Ali Khan", email: "ali.khan@example.com" },
  { name: "Sara Ahmed", email: "sara.ahmed@example.com" },
  { name: "Ayesha Malik", email: "ayesha.malik@example.com" },
];

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Mascot */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src="/teacher_mascot_nobg.png"
            alt="StudyLabz Mascot"
            className="mb-4 w-28 h-auto"
          />
          <p className="text-sm text-white/80 text-center md:text-left">
            StudyLabz - Connect, share, and explore past exam questions.
          </p>
        </div>

        {/* Created by */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Created by</h4>
          <ul className="space-y-3 text-sm text-white/90">
            {creators.map((creator, index) => (
              <li
                key={index}
                className="flex flex-col md:flex-row md:items-center md:space-x-2"
              >
                <span className="md:w-40">{creator.name}</span>
                <a
                  href={`mailto:${creator.email}`}
                  className="text-white/80 hover:text-white underline md:mr-2"
                >
                  {creator.email}
                </a>
                <a
                  href="#"
                  className="ml-0 md:ml-2 text-white/80 hover:text-white transition-transform transform hover:scale-110"
                  title="GitHub"
                >
                  <IconBrandGithubFilled className="w-5 h-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/90">
            <li>
              <a href="/about" className="hover:text-white underline">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white underline">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/faq" className="hover:text-white underline">
                FAQ
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-white underline">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Contact Us</h4>
          <p className="text-sm text-white/90">For general inquiries or support:</p>
          <a
            href="mailto:studylabz2025@gmail.com"
            className="block mt-2 text-white/80 hover:text-white underline text-sm"
          >
            studylabz2025@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-10 border-t border-white/20 pt-4 text-center text-white/70 text-sm">
        &copy; {new Date().getFullYear()} StudyLabz. All rights reserved.
      </div>
    </footer>
  );
}
