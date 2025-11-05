import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen text-neutral flex flex-col bg-sf-cream" >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <Navbar />
        <main className="flex-1 fadein-slow">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

