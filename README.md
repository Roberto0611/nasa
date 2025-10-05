<div align="center">
  <img src="meteorica.png" alt="Meteorica Logo" width="200"/>
  
  # 🌍 Meteorica
  
  ### NASA Space Apps Challenge 2025
  
  **An Interactive Meteorite Impact Simulator & Educational Platform**
  
  ![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-blue.svg)
  ![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)
  ![React](https://img.shields.io/badge/React-19.0-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
  
</div>

---

## 🌟 Overview

**Meteorica** is a comprehensive web-based platform that combines real NASA data with cutting-edge web technologies to create an immersive educational experience about meteorite impacts. Built for the NASA Space Apps Challenge 2025, this project aims to make space science accessible, interactive, and engaging for students, educators, and space enthusiasts worldwide.

### 🎯 Mission

Our mission is to educate and inspire the next generation of space scientists by providing:
- **Real-time impact simulations** based on authentic NASA Near-Earth Object (NEO) data
- **Interactive learning modules** teaching the physics behind meteorite impacts
- **Comprehensive database** of 160M+ documented meteorites from NASA
- **AI-powered assistance** to answer questions and provide insights
- **Gamified learning** experience with practical tasks and achievements

---

## ✨ Features

### 🚀 Meteorite Impact Simulator
- **Real-time 3D visualization** of meteorite impacts using Three.js
- **Customizable parameters**: radius, velocity, entry angle, and material composition
- **Accurate physics calculations**:
  - Kinetic energy (KE = ½mv²)
  - Crater diameter estimation
  - Atmospheric fragmentation analysis
  - Impact energy in TNT equivalent (megatons)
- **Interactive map integration** to visualize impact zones worldwide
- **Downloadable results** with shareable impact cards for social media

### 🎓 NASA Academy
- **Structured learning path** with 3 comprehensive lessons:
  1. **Understanding Meteoroid Radius** (12 min, Beginner)
     - Cubic relationship between radius and mass
     - Real-world examples: Chelyabinsk, Tunguska
  2. **Impact Velocity and Kinetic Energy** (15 min, Beginner)
     - Squared velocity relationship
     - TNT equivalence calculations
  3. **Atmospheric Entry and Fragmentation** (20 min, Intermediate)
     - Ram pressure physics
     - Material strength analysis
- **Practical tasks** integrated with the simulator
- **Progress tracking** with completion badges
- **Markdown-based content** for easy updates

### 🗄️ Meteorite Database
- **160M+ NASA meteorites** with verified scientific data
- **User-created simulations** gallery
- **Advanced filtering** by:
  - Classification (chondrite, iron, stony-iron, etc.)
  - Discovery year
  - Mass range
  - Geographic location
- **Direct import to simulator** for quick experimentation
- **Detailed metadata** including coordinates, mass, and composition

### 🤖 NASAbot AI Assistant
- **Powered by Google Gemini AI** for intelligent responses
- **🎯 AI Impact Analysis**:
  - Comprehensive post-simulation analysis
  - Historical comparisons with real events (Tunguska, Chelyabinsk, Chicxulub)
  - Threat level assessment (Insignificant → Catastrophic)
  - Detailed effects analysis (blast radius, thermal effects, tsunamis)
  - Mitigation strategies and deflection recommendations
  - Beautiful markdown-formatted reports with visualizations
- **Context-aware explanations** of simulation results
- **Educational Q&A** about atmospheric physics, impact energy, crater formation
- **Multilingual support** (English/Spanish)
- **Floating chat interface** accessible from any page

### 🛡️ Planetary Defense Simulator ⭐ **NEW!**
- **Interactive deflection strategy testing** - THE feature requested by NASA Space Apps!
- **4 Real-World Strategies** based on actual missions and research:
  - 🚀 **Kinetic Impactor** (NASA DART mission - successful 2022)
  - 🛰️ **Gravity Tractor** (ESA/NASA concept)
  - ☢️ **Nuclear Standoff** (Lawrence Livermore studies)
  - 🔬 **Laser Ablation** (DE-STAR concept)
- **Real Physics Calculations**:
  - Momentum transfer (Δv = m·v·β / M)
  - Orbital deflection angles
  - Miss distance from Earth
  - Success/failure predictions
- **User-Adjustable Parameters**:
  - Detection lead time (1-10 years slider)
  - Strategy selection with visual feedback
- **Comprehensive Results**:
  - Delta-V applied (cm/s precision)
  - Miss distance (km and Earth radii)
  - Mission cost ($B USD)
  - Success probability (%)
  - Safety level assessment
- **Comparison Mode**: Test all 4 strategies side-by-side
- **AI Recommendations**: Best strategy based on effectiveness score
- **Educational Integration**: Learn trade-offs between cost, time, and reliability

### 📊 Data Visualization
- **Interactive 3D Earth model** with realistic textures
- **Impact crater visualization** with shock wave animations
- **Real-time parameter updates** reflected in the 3D scene
- **Comparison tools** for different impact scenarios
- **Statistical insights** from simulation results

### 🌐 Social Sharing
- **Professional impact cards** with auto-generated graphics
- **One-click sharing** to:
  - Instagram (with caption copy)
  - Facebook
  - Twitter
  - WhatsApp
- **Engagement features** for educational outreach

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 12.x (PHP 8.2+)
- **Database**: PostgreSQL (SQLite for development)
- **Authentication**: Laravel Fortify
- **API Integration**: NASA NEO API, Supabase
- **AI**: Google Gemini PHP Client

### Frontend
- **Framework**: React 19.0
- **Language**: TypeScript 5.7
- **Routing**: Inertia.js 2.x (SSR-ready)
- **Styling**: TailwindCSS 4.0
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber + Three.js
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Maps**: React Leaflet
- **Markdown**: React Markdown

### Development Tools
- **Build Tool**: Vite 7.x
- **Testing**: Pest (PHP), React Testing Library
- **Code Quality**: ESLint, Prettier, Laravel Pint
- **Version Control**: Git

---
## 📖 Usage

### Running Simulations

1. **Navigate to Simulator**: Click "Try Simulation" from the landing page
2. **Select Meteoroid**: Choose from NASA database or create custom
3. **Set Parameters**:
   - Radius: 1-100+ meters
   - Velocity: 11-72 km/s (cosmic speeds)
   - Entry Angle: 0-90 degrees
   - Material: Rock, Iron, or Nickel
4. **Choose Impact Location**: Click on the interactive map
5. **Simulate**: Click "Simulate Impact" to see results
6. **Analyze Results**: View energy, crater size, and fragmentation data
7. **Share**: Download impact card and share on social media

### Learning Path

1. **Explore Academy**: Visit `/academy` to see all lessons
2. **Start Lesson**: Click "Start Lesson" on any topic
3. **Read Content**: Learn about physics concepts with real examples
4. **Complete Task**: Try the practical exercise in the simulator
5. **Mark Complete**: Track your progress

### Using NASAbot

1. **Access Chat**: Click the chat icon (floating button)
2. **Ask Questions**: Type your question about space science
3. **Get Explanations**: Receive AI-powered answers with context
4. **Quick Questions**: Use suggested prompts for common topics

---

## �️ Technology Stack

**Backend**: Laravel 12, PHP 8.2+, PostgreSQL, Laravel Fortify, Google Gemini AI

**Frontend**: React 19, TypeScript 5.7, Inertia.js, TailwindCSS 4.0, Framer Motion, Three.js, React Hook Form

**Tools**: Vite 7, ESLint, Prettier, Pest Testing

---

## 👥 Team

**Meteorica** was developed by a passionate team for the NASA Space Apps Challenge 2025.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  
  ### 🌟 Made with ❤️ for NASA Space Apps Challenge 2025
  
  **Educating the world about space, one impact at a time** 🚀
  
</div>
