import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import carImage from "./white_car_processed.jpg";
import ClusterInsights from "./components/ClusterInsights";
import FuelEfficiencyChart from "./components/FuelEfficiencyChart";
import CarDashboard from "./components/CarDashboard";
import ClusterGraph from "./components/ClusterGraph";
import CarCanvas from "./components/CarModel";

type SectionKeys = "dataObservability" | "fuelEconomy" | "carbonFootprint" | "predictiveAlerts" | "clusterInsights";

const LandingPage: React.FC = () => {
  type SectionKeys =
  | "dataObservability"
  | "fuelEconomy"
  | "clusterInsights"

const sectionRefs: Record<SectionKeys, React.RefObject<HTMLDivElement>> = {
  dataObservability: useRef<HTMLDivElement>(null),
  fuelEconomy: useRef<HTMLDivElement>(null),
  clusterInsights: useRef<HTMLDivElement>(null)
};


  const scrollToSection = (key: SectionKeys) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Shared state for automatic inputs
  const [sharedInputs, setSharedInputs] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      const car = document.querySelector(".car-animation") as HTMLElement;
      if (car) {
        const scrollTop = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = scrollTop / maxScroll;
        const maxTranslateX = window.innerWidth;
        const translateX = scrollFraction * maxTranslateX;
        car.style.transform = `translateX(-${translateX}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="landing-page-container">
      {/* Header Section */}
      <header className="landing-header">
        <h1 className="typing-animation">DataDrive.</h1>
        <p>
          <em>
            Optimize fuel efficiency, reduce emissions, and gain insights with
            our AI-powered dashboard.
          </em>
        </p>
        <CarCanvas />
      </header>

      {/* Navigation Buttons */}
      <nav className="landing-navigation">
        {Object.keys(sectionRefs).map((key) => (
          <button
            key={key}
            onClick={() => scrollToSection(key as SectionKeys)}
            className="nav-button"
          >
            {key.replace(/([A-Z])/g, " $1").toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Flashcards Section */}
      <div className="features-section">
        
        {/* Carbon Footprint Placeholder */}
        <div className="feature-card">
          <h3>CARS BY CLUSTER</h3>
          <ClusterGraph />
        </div>
        
        {/* Car Dashboard */}
        <div className="feature-card">
          <h3>CAR DASHBOARD</h3>
          <CarDashboard setSharedInputs={setSharedInputs} />
        </div>

        {/* Fuel Economy Section */}
        <div ref={sectionRefs.fuelEconomy} className="feature-card">
          <h3>FUEL ECONOMY</h3>
          <FuelEfficiencyChart autoInputs={sharedInputs} />
        </div>

        {/* Cluster Insights Section */}
        <div ref={sectionRefs.clusterInsights} className="feature-card">
          <h3>CLUSTER INSIGHTS</h3>
          <ClusterInsights autoInputs={sharedInputs} />
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
