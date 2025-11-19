import { IconBrandLinkedin } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ResponsiveOptimizedImage from '../components/ResponsiveOptimizedImage';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-sf-border text-sf-text py-6 rounded-t-[6rem]">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-4 md:mb-0">
          <ResponsiveOptimizedImage
            publicId="StudyLabzLogoStamp-nobg_jpfjgu"
            alt="StudyLabz Logo"
            className="w-30 h-25 object-contain mb-1"
          />
          <p className="text-xs text-sf-text/80 text-center">
            © {new Date().getFullYear()} StudyLabz — All Rights Reserved
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-sf-green transition-colors">
            Home
          </a>
          <a href="/About" className="hover:text-sf-green transition-colors">
            About Us
          </a>
          <button
            onClick={() => navigate("/Contact")}
            className="hover:text-sf-green transition-colors font-medium"
          >
            Contact Us
          </button>
        </div>

        {/* Social Icon */}
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Tippy content="Connect on LinkedIn">
            <a
              href="#"
              className="p-2 rounded-full bg-sf-text hover:text-sf-green transition-all duration-300"
            >
              <IconBrandLinkedin size={20} className="text-white" />
            </a>
          </Tippy>
        </div>
      </div>
    </footer>
  );
}
