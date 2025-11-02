import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-white text-purple-950 flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <Navbar />
        {children}
        <Footer/>
      </div>
    </div>
  );
}
