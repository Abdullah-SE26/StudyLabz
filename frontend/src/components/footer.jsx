import {
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import {useNavigate} from 'react-router-dom'


export default function Footer() {

  const navigate = useNavigate();
  return (
    <footer className="relative text-white overflow-hidden">
      {/* Full Background Image */}
      <img
        src="/footer-image-full.png"
        alt="Footer Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Heading */}
        <h2 className="text-2xl md:text-4xl font-bold mb-8">
          𝚈𝙾𝚄 𝙲𝙰𝙽 𝙷𝙴𝙻𝙿 𝚂𝙷𝙰𝙿𝙴 𝚃𝙷𝙴 𝙵𝚄𝚃𝚄𝚁𝙴
        </h2>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base mb-10">
          <a href="/" className="hover:text-orange-300 transition">
            Home
          </a>
          <a href="/About" className="hover:text-orange-300 transition">
            About Us
          </a>
          <a href="/faqs" className="hover:text-orange-300 transition">
            FAQs
          </a>
        </div>

        {/* CTA Button */}
        <button  onClick={() => navigate('/Contact')} className="bg-transparent border border-blue-100 text-white hover:bg-blue-500 hover:text-white cursor-pointer px-6 py-3 rounded-md font-semibold mb-15 transition">
          CONTACT US
        </button>

        {/* Social Icons */}
        <div className="flex space-x-6 mb-6">
          <a href="#" className="hover:text-pink-400 transition">
            <IconBrandInstagram size={24} />
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            <IconBrandLinkedin size={24} />
          </a>
        </div>

        {/* Footer Bottom */}
        <p className="text-xs text-gray-300">
          © {new Date().getFullYear()} StudyLabz — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
