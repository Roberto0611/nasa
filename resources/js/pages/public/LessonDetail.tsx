import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';

interface Lesson {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    category: string;
    difficulty_level: number;
    difficulty_text: string;
    duration_minutes: number;
    icon: string;
    practical_task: string | null;
    learning_objectives: string[];
    key_concepts: string[];
}

interface LessonDetailProps {
    lesson: Lesson;
}

const LessonDetail: React.FC<LessonDetailProps> = ({ lesson }) => {
    const [taskCompleted, setTaskCompleted] = useState(false);

    const getDifficultyColor = (level: number) => {
        switch(level) {
            case 1: return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 3: return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-700">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/academy" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Academy</span>
                    </Link>
                    <Link href="/sim">
                        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition">
                            Try in Simulator →
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-12">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Lesson Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-6xl">{lesson.icon}</span>
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(lesson.difficulty_level)}`}>
                                            {lesson.difficulty_text}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                                            {lesson.category}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {lesson.duration_minutes} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-4">
                                {lesson.title}
                            </h1>
                            <p className="text-xl text-gray-400">
                                {lesson.description}
                            </p>
                        </div>

                        {/* Learning Objectives */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>🎯</span>
                                Learning Objectives
                            </h2>
                            <ul className="space-y-2">
                                {lesson.learning_objectives.map((obj, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-300">{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Key Concepts */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3 text-gray-400">Key Concepts:</h3>
                            <div className="flex flex-wrap gap-2">
                                {lesson.key_concepts.map((concept, index) => (
                                    <span key={index} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300">
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Lesson Content */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert prose-lg max-w-none
                                   prose-headings:text-white prose-headings:font-bold
                                   prose-h1:text-4xl prose-h1:mb-6
                                   prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-blue-300
                                   prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-purple-300
                                   prose-p:text-gray-300 prose-p:leading-relaxed
                                   prose-strong:text-white prose-strong:font-bold
                                   prose-ul:text-gray-300
                                   prose-li:text-gray-300
                                   prose-code:text-blue-400 prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                                   prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700"
                    >
                        <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
                            <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Practical Task Section */}
            {lesson.practical_task && (
                <section className="pb-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/50 rounded-xl p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="text-5xl">🚀</div>
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">Practical Task</h2>
                                        <p className="text-gray-400">Apply what you've learned in the simulator</p>
                                    </div>
                                </div>

                                <div className="bg-black/30 rounded-lg p-6 mb-6">
                                    <p className="text-lg text-gray-300 leading-relaxed">
                                        {lesson.practical_task}
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <Link href="/sim" className="flex-1">
                                        <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>Open Simulator</span>
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => setTaskCompleted(!taskCompleted)}
                                        className={`flex-1 px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2 ${
                                            taskCompleted 
                                                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                                : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        {taskCompleted ? (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Task Completed!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Mark as Complete</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {taskCompleted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                                    >
                                        <p className="text-green-400 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Great work! You've completed this practical task. Continue exploring more lessons to master meteorite impact science!
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Navigation Footer */}
            <section className="pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="flex justify-between items-center">
                        <Link href="/academy">
                            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to All Lessons</span>
                            </button>
                        </Link>
                        <Link href="/">
                            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition">
                                Home
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800 py-8">
                <div className="container mx-auto px-6 text-center text-gray-600">
                    <p>&copy; 2025 NASA Academy. Educational platform for Space Apps Challenge.</p>
                </div>
            </footer>
        </div>
    );
};

export default LessonDetail;
