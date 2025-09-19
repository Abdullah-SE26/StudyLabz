import Navbar from "../components/Navbar";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen px-6 py-6 bg-base-100 text-base-content">
      <div className="w-full max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
