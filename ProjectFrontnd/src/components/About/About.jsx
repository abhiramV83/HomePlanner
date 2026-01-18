import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about">
      <div className="about__container">
        <h1 className="about__title">About HomePlanner</h1>
        <p className="about__subtitle">
          HomePlanner is an AI-powered luxury home plan generator that helps you
          create floor-wise home layouts in seconds.
        </p>

        <div className="about__grid">
          <div className="about__card">
            <h2>✨ What it does</h2>
            <p>
              Enter plot size, floors, bedrooms, style, and extras — HomePlanner
              generates a modern luxury home plan with room sizes and premium
              features.
            </p>
          </div>

          <div className="about__card">
            <h2>⚡ Tech Stack</h2>
            <ul>
              <li>Frontend: React + Vite</li>
              <li>Backend: FastAPI</li>
              <li>AI Model: Gemini 2.5 Flash</li>
              <li>Hosting: GitHub Pages (Frontend)</li>
            </ul>
          </div>

          <div className="about__card">
            <h2>🎯 Why HomePlanner?</h2>
            <p>
              It saves time, gives creative ideas, and helps visualize luxury
              home planning without needing professional CAD tools.
            </p>
          </div>
        </div>

        <div className="about__footer">
          <p>
            Built by <span>Abhiram</span> 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
