import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection"
import HomeSearchBar from "../components/HomeSearchBar";
 

const Home = () => {
  return (
    <>
      
      <div className="py-0.5">
        <HeroSection/>
        <HomeSearchBar/>
        <FeaturesSection/>
      </div>
    </>
  );
};

export default Home;
