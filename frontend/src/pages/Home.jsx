import HeroSection from "../components/hero-section";
import Footer from "../components/footer";
import FeaturesSection from "../components/features-section";
 

const Home = () => {
  return (
    <>
      
      <div className="py-0.5">
        <HeroSection/>
        <FeaturesSection/>
        <Footer/>
      </div>
    </>
  );
};

export default Home;
