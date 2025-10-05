import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Canvas } from '@react-three/fiber';
import Earth from '../../../assets/Planets/earth';
import { Suspense } from 'react';
// Componente de la Tierra con texturas reales

const ScrollToCourses = () => {
    window.location.href = '#courses';
};

const LandingPage = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/90 backdrop-blur-md border-b border-gray-700' : 'bg-transparent'}`}>
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.svg" alt="NASA Logo" className="h-12 w-12" />
                        <span className="text-2xl font-bold">NASA Academy</span>
                    </div>
                    <ul className="hidden md:flex space-x-8">
                        <li><a href="#home" className="hover:text-gray-300 transition">Home</a></li>
                        <li><a href="#courses" className="hover:text-gray-300 transition">Courses</a></li>
                        <li><a href="#features" className="hover:text-gray-300 transition">Features</a></li>
                        <li>
                            <Link href="/meteorites" className="hover:text-gray-300 transition">
                                Meteorites Database
                            </Link>
                        </li>
                        <li><a href="#about" className="hover:text-gray-300 transition">About</a></li>
                        <li><a href="#contact" className="hover:text-gray-300 transition">Contact</a></li>
                    </ul>
                    <button className="md:hidden text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center px-4"
                >
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 text-transparent bg-clip-text">
                        Learn Space Science
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
                        Master astronomy, physics, and planetary science with NASA's interactive educational platform
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link href="#courses">
                            <button onClick={ScrollToCourses} className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-semibold transition transform hover:scale-105">
                                Start Learning
                            </button>
                        </Link>
                        <Link href="/sim">
                            <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-semibold transition transform hover:scale-105">
                                Try Simulation
                            </button>
                        </Link>

                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-black/50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: '100%', label: 'Personalizable Meteorites' },
                            { number: '10K+', label: 'Active Students' },
                            { number: '160M+', label: 'Meteorites ' },
                            { number: '100%', label: 'Free Access' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6"
                            >
                                <h3 className="text-5xl font-bold text-white mb-2">{stat.number}</h3>
                                <p className="text-gray-500">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-bold mb-4">Physics & Mathematics</h2>
                        <p className="text-xl text-gray-500">Understand the formulas behind asteroid impact science</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Kinetic Energy',
                                formula: 'KE = ½mv²',
                                description: 'Calculate the energy released upon impact based on mass and velocity',
                                icon: '⚡',
                                variables: 'm = mass, v = velocity'
                            },
                            {
                                title: 'Impact Crater Diameter',
                                formula: 'D = 1.8 × (ρₐ/ρₜ)^(1/3) × L^0.78 × v^0.44',
                                description: 'Estimate the size of the crater formed by the asteroid impact',
                                icon: '🕳️',
                                variables: 'ρₐ = asteroid density, ρₜ = target density'
                            },
                            {
                                title: 'Atmospheric Entry',
                                formula: 'dv/dt = -½ × (ρA/m) × Cᴅ × v²',
                                description: 'Model velocity changes as the asteroid enters the atmosphere',
                                icon: '🌐',
                                variables: 'ρ = air density, Cᴅ = drag coefficient'
                            },
                            {
                                title: 'Explosive Yield',
                                formula: 'E = ½mv² (in TNT equivalent)',
                                description: 'Convert kinetic energy to equivalent TNT explosive power',
                                icon: '💥',
                                variables: '1 kiloton = 4.184 × 10¹² joules'
                            },
                            {
                                title: 'Orbital Velocity',
                                formula: 'v = √(GM/r)',
                                description: 'Calculate the velocity needed for orbital mechanics',
                                icon: '🛸',
                                variables: 'G = gravitational constant, M = mass'
                            },
                            {
                                title: 'Impact Angle Effects',
                                formula: 'E_eff = E × sin²(θ)',
                                description: 'Determine effective energy based on entry angle',
                                icon: '📐',
                                variables: 'θ = angle from horizontal'
                            }
                        ].map((formula, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700 hover:border-gray-500 transition group cursor-pointer"
                            >
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-4xl">{formula.icon}</span>
                                        <h3 className="text-xl font-bold group-hover:text-gray-300 transition">{formula.title}</h3>
                                    </div>
                                    <div className="bg-black/50 rounded-lg p-4 mb-4 font-mono text-center border border-gray-600">
                                        <p className="text-lg text-white">{formula.formula}</p>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{formula.description}</p>
                                    <p className="text-gray-500 text-xs italic">{formula.variables}</p>
                                    <Link href="/formulas">
                                        <button className="mt-4 text-white hover:text-gray-300 font-semibold flex items-center gap-2 group text-sm">
                                            Learn More
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mt-12"
                    >
                        <Link href="/formulas">
                            <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition transform hover:scale-105">
                                Explore All Formulas
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Featured Asteroid Simulator Section */}
            <section id="features" className="py-20 bg-gradient-to-r from-gray-900/50 to-black/50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <span className="text-gray-400 font-semibold mb-2 block">FEATURED TOOL</span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Asteroid Impact Simulator
                            </h2>
                            <p className="text-gray-500 text-lg mb-6">
                                Experience real-time asteroid trajectory simulations based on NASA data. Learn about Near-Earth Objects (NEOs),
                                calculate impact scenarios, and understand planetary defense strategies.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Real NASA asteroid data</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>3D interactive visualization</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Impact calculation engine</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Educational insights and analysis</span>
                                </li>
                            </ul>

                            <div className="flex gap-4">
                                <Link href="/sim">
                                    <button className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition transform hover:scale-105">
                                        Launch Simulator
                                    </button>
                                </Link>
                                <Link href="/meteorites">
                                    <button className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition transform hover:scale-105">
                                        Meteorites List
                                    </button>
                                </Link>
                            </div>

                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-2xl  to-gray-900">
                                <Canvas>
                                    {/* Suspense anidado para carga de texturas de la Tierra */}
                                    <Suspense fallback={null}>
                                        {/* Tierra con texturas reales de 8K y animación de rotación */}
                                        <Earth />
                                    </Suspense>
                                </Canvas>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Meteorites Database Section */}
            <section className="py-20 bg-black/50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <span className="text-gray-400 font-semibold mb-2 block">COMPREHENSIVE DATABASE</span>
                        <h2 className="text-5xl font-bold mb-4">160M+ NASA Meteorites</h2>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                            Explore our extensive collection of documented meteorites from NASA's database,
                            plus thousands of user-created simulations
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
                        >
                            <div className="text-5xl mb-4">🌍</div>
                            <h3 className="text-2xl font-bold mb-3">NASA Collection</h3>
                            <p className="text-gray-400">
                                Access verified data on meteorites discovered and documented by NASA scientists worldwide
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
                        >
                            <div className="text-5xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold mb-3">User Created</h3>
                            <p className="text-gray-400">
                                Browse custom meteoroid simulations created by students and researchers
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
                        >
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold mb-3">Advanced Search</h3>
                            <p className="text-gray-400">
                                Filter by mass, composition, year of discovery, and entry parameters
                            </p>
                        </motion.div>
                    </div>

                    <div className="text-center">
                        <Link href="/meteorites">
                            <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-semibold transition transform hover:scale-105">
                                Explore Meteorites Database →
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Learning Resources Gallery */}
            <section id="gallery" className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-bold mb-4">Learning Resources</h2>
                        <p className="text-xl text-gray-500">Interactive tools and educational materials</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: '🔭', label: 'Telescopes' },
                            { icon: '🌍', label: 'Earth Science' },
                            { icon: '🌙', label: 'Moon Phases' },
                            { icon: '⭐', label: 'Star Charts' },
                            { icon: '🛰️', label: 'Satellites' },
                            { icon: '🌌', label: 'Galaxies' },
                            { icon: '🚀', label: 'Rockets' },
                            { icon: '👨‍🚀', label: 'Astronauts' }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition group border border-gray-700 hover:border-gray-500"
                            >
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 group-hover:bg-gray-800/50 transition">
                                    <span className="text-5xl">{item.icon}</span>
                                    <span className="text-sm text-gray-600 group-hover:text-white transition font-semibold">{item.label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-black/50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-5xl font-bold mb-6">About NASA Academy</h2>
                            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                                NASA Academy is your gateway to understanding the universe. We provide free, high-quality space science education
                                powered by NASA's vast knowledge and research. Whether you're a student, educator, or space enthusiast,
                                our platform offers interactive courses, simulations, and resources to fuel your cosmic curiosity.
                            </p>
                            <div className="grid md:grid-cols-3 gap-8 mt-12">
                                <div className="p-6">
                                    <div className="text-5xl mb-4">�</div>
                                    <h3 className="text-xl font-bold mb-2">Expert Content</h3>
                                    <p className="text-gray-400">Courses designed by NASA scientists and educators</p>
                                </div>
                                <div className="p-6">
                                    <div className="text-5xl mb-4">�</div>
                                    <h3 className="text-xl font-bold mb-2">Interactive Learning</h3>
                                    <p className="text-gray-400">Hands-on simulations and real-world applications</p>
                                </div>
                                <div className="p-6">
                                    <div className="text-5xl mb-4">🌐</div>
                                    <h3 className="text-xl font-bold mb-2">Global Community</h3>
                                    <p className="text-gray-400">Connect with learners worldwide</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section id="contact" className="py-20 bg-gradient-to-r from-gray-900/50 to-black/50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <h2 className="text-4xl font-bold mb-4">Join Our Learning Community</h2>
                        <p className="text-gray-500 mb-8">
                            Subscribe to receive course updates, new learning materials, and exclusive space science content
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-6 py-4 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:border-white flex-1 max-w-md"
                            />
                            <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition">
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800 py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4">NASA Academy</h3>
                            <ul className="space-y-2 text-gray-500">
                                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition">Our Mission</a></li>
                                <li><a href="#" className="hover:text-white transition">Instructors</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Learning</h3>
                            <ul className="space-y-2 text-gray-500">
                                <li><a href="#" className="hover:text-white transition">All Courses</a></li>
                                <li><a href="/sim" className="hover:text-white transition">Asteroid Simulator</a></li>
                                <li><a href="#" className="hover:text-white transition">Certifications</a></li>
                                <li><a href="#" className="hover:text-white transition">Study Guides</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Resources</h3>
                            <ul className="space-y-2 text-gray-500">
                                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition">Video Library</a></li>
                                <li><a href="#" className="hover:text-white transition">Research Papers</a></li>
                                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Connect</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition">
                                    <span>X</span>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition">
                                    <span>FB</span>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition">
                                    <span>IG</span>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition">
                                    <span>YT</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-600">
                        <p>&copy; 2025 NASA Academy. Educational platform powered by NASA. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
