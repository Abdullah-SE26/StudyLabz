import React from "react";
import HeroSection from "../components/hero-section";
import Accordion from "../components/accordion";
 

const Home = () => {
  return (
    <>
      
      <div className="p-6">
        <HeroSection/>
        <Accordion/>
      </div>
    </>
  );
};

export default Home;
