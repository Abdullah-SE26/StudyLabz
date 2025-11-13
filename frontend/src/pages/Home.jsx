import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection"
import HomeSearchBar from "../components/HomeSearchBar";
import StatsSection from "../components/StatsSection";
 

const Home = () => {
  return (
    <>
      
      <div className="py-0.5">
        <HeroSection/>
        <HomeSearchBar/>
        <FeaturesSection/>
        <StatsSection/>
      </div>
    </>
  );
};

export default Home;
