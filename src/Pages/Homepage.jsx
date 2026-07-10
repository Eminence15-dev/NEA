import React from "react";
import { runners100, runners200 } from "../data/athleteData";

// Component Imports
import NavBar from "../components/Navbar";
import StatCard from "../components/StatCard";
import FastestAthleteCard from "../components/FastestAthleteCard";
import RecentSimulations from "../components/RecentSimulations";
import QuickActions from "../components/QuickActions";

const HomePage = ({ 
  setCurrentPage, 
  customAthletes, 
  recentSimulations, 
  onClearSimulations, 
  Toast, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  darkMode, 
  toggleDarkMode 
}) => {
  const totalStatic = runners100.length + runners200.length;
  const totalAthletes = totalStatic + customAthletes.length;

  const fastest100 = [...runners100].sort((a, b) => a.raceTime - b.raceTime)[0];
  const fastest200 = [...runners200].sort((a, b) => a.raceTime - b.raceTime)[0];

  const dm = darkMode;

  // Configuration for your modularized StatCards
  const statCardsData = [
    { label: "Total Athletes", val: totalAthletes, sub: "Across 100m & 200m" },
    { label: "Custom Saved", val: customAthletes.length, sub: "Auto-saved from sims" },
    { label: "Simulations", val: recentSimulations.length, sub: "This Session" },
    { label: "100m World Record", val: `${fastest100?.raceTime}s`, sub: fastest100?.name || "" },
  ];

  const card = dm ? "bg-[#080808]" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const sub = dm ? "text-[#8f7d45]" : "text-gray-500";

  return (
    <div className={`min-h-screen ${dm ? 'bg-black' : 'bg-white'} p-5`}>
      <Toast />
      <div className={`max-w-7xl mx-auto rounded-[2rem] ${card} ${dm ? 'shadow-[0_15px_60px_rgba(177,145,73,0.18)]' : 'shadow'}`}>
        
        <NavBar 
          page="dashboard" 
          setCurrentPage={setCurrentPage} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
          customAthleteCount={customAthletes.length} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
        />

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCardsData.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Fastest Athletes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {fastest100 && (
            <FastestAthleteCard 
              title="Fastest 100m in Dataset" 
              runner={fastest100} 
              accent="#d6b451" 
              bgStyle="rgba(214,180,81,0.12)"
              card={card} text={text} muted={muted} sub={sub}
            />
          )}
          {fastest200 && (
            <FastestAthleteCard 
              title="Fastest 200m in Dataset" 
              runner={fastest200} 
              accent="#d6b451" 
              bgStyle="rgba(255,209,87,0.12)"
              card={card} text={text} muted={muted} sub={sub}
            />
          )}
        </div>

        {/* Bottom Section: Recent Simulations + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentSimulations 
            recentSimulations={recentSimulations} 
            onClearSimulations={onClearSimulations}
            setCurrentPage={setCurrentPage}
            card={card} text={text} muted={muted} sub={sub}
          />
          
          <QuickActions 
            setCurrentPage={setCurrentPage} 
            totalAthletes={totalAthletes} 
            muted={muted} 
            text={text} 
          />
        </div>

      </div>
    </div>
  );
};

export default HomePage;