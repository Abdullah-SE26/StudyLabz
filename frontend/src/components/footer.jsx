import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-gray-100 py-12 mt-20 overflow-hidden">
      {/* Subtle top wave / divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />

      <div className="container mx-auto px-6 flex flex-col items-center text-center space-y-8 relative z-10">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg tracking-tight">
          You Can Help Shape The Future
        </h2>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
          {[
            { name: "Home", href: "/" },
            { name: "About Us", href: "/About" },
            { name: "FAQs", href: "/faqs" },
          ].map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative group font-medium"
            >
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/Contact")}
          className="btn border-0 bg-cyan-500 hover:bg-cyan-400 cursor-pointer text-white font-semibold px-8 py-2 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
        >
          Contact Us
        </button>

        {/* Divider */}
        <div className="w-24 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"></div>

        {/* Social Icons */}
        <div className="flex space-x-6">
          {[
            { Icon: IconBrandLinkedin, href: "#" },
            { Icon: IconBrandTwitter, href: "#" },
            { Icon: IconBrandFacebook, href: "#" },
          ].map(({ Icon, href }, i) => (
            <a
              key={i}
              href={href}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <Icon size={22} className="text-cyan-300" />
            </a>
          ))}
        </div>

        {/* Footer Bottom */}
        <p className="text-xs text-gray-300 tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-cyan-400">StudyLabz</span> — All Rights Reserved
        </p>
      </div>

      {/* Soft gradient glow at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-blue-950/60 to-transparent pointer-events-none"></div>
    </footer>
  );
}
