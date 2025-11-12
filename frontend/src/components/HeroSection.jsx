import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-sf-light">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-sf-light opacity-90 -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-sf-green mb-6 leading-tight">
            Study. Share. Succeed.
          </h1>

          <p className="text-sf-text text-lg sm:text-xl font-medium max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
            Create questions, explore answers, and get exam-ready with your peers -{" "}
            <span className="text-sf-green font-semibold">StudyLabz</span> makes
            learning social and smarter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/Courses"
              className="px-7 py-3 bg-sf-green text-sf-cream rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] hover:bg-sf-green-hover transition-all duration-200"
            >
              Explore Courses
            </Link>
            <Link
              to="/Dashboard"
              className="px-7 py-3 border border-sf-green text-sf-green rounded-lg font-semibold hover:bg-sf-border hover:text-sf-green-hover transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <img
            src="/public/heroimage.png"
            alt="StudyLabz Hero Illustration"
            className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto rounded-3xl drop-shadow-md hover:scale-[1.03] transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
}
