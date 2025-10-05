// NasaBot.tsx - Chat interface for NASA AI Assistant
// Interactive chatbot interface with message history and typing indicators

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@inertiajs/react'

type Message = {
    id: number
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

const NasaBot = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm NASAbot, your AI space science assistant powered by Google Gemini. Ask me anything about astronomy, physics, asteroids, or space exploration! 🚀",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Predefined responses for demo (you'll replace this with actual Gemini API calls)
    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase()

        // Asteroid-related questions
        if (lowerMessage.includes('asteroid') || lowerMessage.includes('meteor')) {
            return "Asteroids are rocky remnants from the early formation of our solar system about 4.6 billion years ago. Most asteroids orbit the Sun in the asteroid belt between Mars and Jupiter. They range in size from small boulders to objects hundreds of kilometers in diameter. Would you like to know about specific asteroids or their impact risks?"
        }

        // Speed of light
        if (lowerMessage.includes('speed of light') || lowerMessage.includes('light speed')) {
            return "The speed of light in a vacuum is exactly 299,792,458 meters per second (approximately 300,000 km/s or 186,000 miles/s). This is denoted by the constant 'c' and is the universal speed limit - nothing can travel faster than light in a vacuum. This fundamental constant plays a crucial role in Einstein's theory of relativity."
        }

        // Mars
        if (lowerMessage.includes('mars')) {
            return "Mars, the Red Planet, is the fourth planet from the Sun. It has a thin atmosphere composed mainly of carbon dioxide, surface temperatures averaging -63°C (-81°F), and two small moons: Phobos and Deimos. NASA has successfully landed several rovers on Mars, including Curiosity and Perseverance, which are currently exploring the planet's surface for signs of past microbial life."
        }

        // Black holes
        if (lowerMessage.includes('black hole')) {
            return "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape from it. They form when massive stars collapse at the end of their life cycle. The boundary around a black hole is called the event horizon. Black holes can have masses ranging from a few times our Sun to billions of solar masses (supermassive black holes) found at the centers of galaxies."
        }

        // Earth
        if (lowerMessage.includes('earth')) {
            return "Earth is the third planet from the Sun and the only known planet to harbor life. It has a diameter of about 12,742 km, orbits the Sun at an average distance of 150 million km (1 AU), and completes one orbit in 365.25 days. Earth's atmosphere is composed of 78% nitrogen, 21% oxygen, and trace amounts of other gases. The planet has one natural satellite, the Moon."
        }

        // Moon
        if (lowerMessage.includes('moon')) {
            return "The Moon is Earth's only natural satellite, located about 384,400 km away. It has a diameter of 3,474 km (about 1/4 of Earth's diameter) and takes 27.3 days to orbit Earth. The same side of the Moon always faces Earth due to tidal locking. NASA's Apollo program successfully landed 12 astronauts on the Moon between 1969 and 1972."
        }

        // Solar system
        if (lowerMessage.includes('solar system') || lowerMessage.includes('planets')) {
            return "Our solar system consists of the Sun and everything bound to it by gravity: 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), their moons, dwarf planets like Pluto, asteroids, comets, and interplanetary dust. The solar system formed about 4.6 billion years ago from a giant molecular cloud. Would you like to learn about a specific planet?"
        }

        // Gravity
        if (lowerMessage.includes('gravity')) {
            return "Gravity is one of the four fundamental forces of nature. It's the force of attraction between objects with mass. On Earth, gravity accelerates objects at 9.8 m/s². Newton's law of universal gravitation describes it as F = G(m₁m₂/r²), where G is the gravitational constant. Einstein's general relativity describes gravity as the curvature of spacetime caused by mass and energy."
        }

        // NASA
        if (lowerMessage.includes('nasa')) {
            return "NASA (National Aeronautics and Space Administration) is the United States government agency responsible for the civilian space program and aerospace research. Founded in 1958, NASA has conducted groundbreaking missions including the Apollo Moon landings, Space Shuttle program, International Space Station, Mars rover missions, and the James Webb Space Telescope. NASA's mission is to explore space and expand our understanding of Earth and the universe."
        }

        // Simulation
        if (lowerMessage.includes('simulat') || lowerMessage.includes('sim')) {
            return "Our Asteroid Impact Simulator allows you to model asteroid collisions with Earth! You can customize parameters like size, velocity, entry angle, and material composition. The simulator uses real physics equations to calculate impact energy, crater size, and potential damage. Try it out from the main menu to see how different asteroids would affect our planet!"
        }

        // Greetings
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! 👋 I'm here to help you learn about space science. You can ask me about planets, stars, asteroids, physics formulas, or anything related to astronomy and space exploration!"
        }

        // Thanks
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            return "You're welcome! I'm always here to help you explore the wonders of space. Feel free to ask me anything else! 🌟"
        }

        // Help
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
            return "I can help you with:\n\n🪐 Planetary science and solar system facts\n☄️ Asteroids, meteors, and comets\n⚛️ Physics and mathematical formulas\n🚀 Space missions and NASA history\n🌌 Cosmology and the universe\n🔭 Astronomy and celestial objects\n\nJust ask me a question about any of these topics!"
        }

        // Default response
        return "That's a great question! While I'm currently running in demo mode with predefined responses, the full NASAbot powered by Google Gemini AI will be able to answer any space science question in detail. For now, try asking me about asteroids, planets, the speed of light, black holes, or NASA missions! 🌠"
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsTyping(true)

        // Simulate bot thinking time
        setTimeout(() => {
            const botResponse: Message = {
                id: messages.length + 2,
                text: getBotResponse(inputMessage),
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
            setIsTyping(false)
        }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Quick question suggestions
    const quickQuestions = [
        "What is an asteroid?",
        "Tell me about Mars",
        "How fast is the speed of light?",
        "What are black holes?",
        "Explain gravity"
    ]

    const handleQuickQuestion = (question: string) => {
        setInputMessage(question)
        inputRef.current?.focus()
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl animate-pulse">
                                    🤖
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">NASAbot</h1>
                                    <p className="text-sm text-gray-400">Powered by Google Gemini AI</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/50">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-green-400">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-8 max-w-4xl">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex gap-4 mb-6 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.sender === 'bot'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                        : 'bg-white/10'
                                    }`}>
                                    {message.sender === 'bot' ? '🤖' : '👤'}
                                </div>

                                {/* Message Bubble */}
                                <div className={`max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className={`px-6 py-3 rounded-2xl ${message.sender === 'bot'
                                            ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700'
                                            : 'bg-white text-black'
                                        }`}>
                                        <p className="whitespace-pre-line">{message.text}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 px-2">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 mb-6"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                🤖
                            </div>
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 px-6 py-3 rounded-2xl">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Quick Questions (only show if no messages from user yet) */}
            {messages.length === 1 && (
                <div className="container mx-auto px-6 max-w-4xl pb-4">
                    <p className="text-sm text-gray-400 mb-3">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                        {quickQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickQuestion(question)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition border border-gray-700 hover:border-gray-500"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 sticky bottom-0">
                <div className="container mx-auto px-6 py-4 max-w-4xl">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about space science..."
                                className="w-full px-6 py-4 bg-white/10 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition pr-12"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                {inputMessage.length}/1000
                            </div>
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-2xl font-semibold transition transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                        >
                            <span>Send</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        NASAbot is currently in demo mode with predefined responses. Full Gemini AI integration coming soon! 🚀
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NasaBot
