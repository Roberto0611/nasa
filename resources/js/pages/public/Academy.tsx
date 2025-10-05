import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

interface LearningObjective {
    id: number;
}

interface Lesson {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    difficulty_level: number;
    difficulty_text: string;
    duration_minutes: number;
    icon: string;
    learning_objectives: string[];
}

interface AcademyProps {
    lessons: Lesson[];
}

const Academy: React.FC<AcademyProps> = ({ lessons }) => {
    const getDifficultyColor = (level: number) => {
        switch(level) {
            case 1: return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 3: return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getCategoryColor = (category: string) => {
        switch(category.toLowerCase()) {
            case 'physics': return 'bg-blue-500/20 text-blue-300';
            case 'mathematics': return 'bg-purple-500/20 text-purple-300';
            case 'astronomy': return 'bg-indigo-500/20 text-indigo-300';
            case 'atmospheric science': return 'bg-cyan-500/20 text-cyan-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-700">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-3">
                        <img src="/meteorica.png" alt="Meteorica Logo" className="h-24 w-auto" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Meteorica</span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/">
                            <button className="px-4 py-2 text-gray-300 hover:text-white transition">
                                ← Home
                            </button>
                        </Link>
                        <Link href="/sim">
                            <button className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition">
                                Try Simulator
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block mb-4">
                            <span className="text-6xl">🎓</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 text-transparent bg-clip-text">
                            Meteorica Academy
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
                            Master the physics of meteorite impacts through interactive lessons and hands-on simulations
                        </p>
                        <div className="flex gap-4 justify-center items-center text-gray-500">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📚</span>
                                <span>{lessons.length} Lessons</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⏱️</span>
                                <span>{lessons.reduce((sum, l) => sum + l.duration_minutes, 0)} Minutes</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🚀</span>
                                <span>Practical Tasks</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Lessons Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {lessons.map((lesson, index) => (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/academy/${lesson.slug}`}>
                                    <div className="group h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:scale-105">
                                        {/* Card Header */}
                                        <div className="p-6 border-b border-gray-700/50">
                                            <div className="flex items-start justify-between mb-4">
                                                <span className="text-5xl">{lesson.icon}</span>
                                                <div className="flex flex-col gap-2 items-end">
                                                    <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(lesson.difficulty_level)}`}>
                                                        {lesson.difficulty_text}
                                                    </span>
                                                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(lesson.category)}`}>
                                                        {lesson.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {lesson.description}
                                            </p>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Learning Objectives:</h4>
                                                <ul className="space-y-1">
                                                    {lesson.learning_objectives.slice(0, 3).map((obj, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                                                            <span className="text-blue-400 mt-1">•</span>
                                                            <span>{obj}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{lesson.duration_minutes} min</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all">
                                                    <span>Start Lesson</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-20 text-center"
                    >
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-12 max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
                            <p className="text-gray-400 mb-6 text-lg">
                                Apply what you've learned in our interactive meteorite impact simulator
                            </p>
                            <Link href="/sim">
                                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2 mx-auto">
                                    <span>Launch Simulator</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800 py-8 mt-20">
                <div className="container mx-auto px-6 text-center text-gray-600">
                    <p>&copy; 2025 Meteorica. Asteroid impact simulation platform powered by NASA data.</p>
                </div>
            </footer>
        </div>
    );
};

export default Academy;
