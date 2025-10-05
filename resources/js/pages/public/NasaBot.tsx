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
            text: "¡Hola! Soy NASAbot, tu asistente de ciencias espaciales impulsado por Google Gemini. Soy un profesor experto en astrofísica especializado en meteorología espacial. Puedo ayudarte a entender simulaciones de impactos de asteroides, resolver dudas sobre física espacial, y explicarte cualquier cosa sobre astronomía y exploración espacial. ¡Pregúntame lo que quieras! 🚀",
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

    // Real API call to NASA Expert using Gemini
    const getBotResponse = async (userMessage: string): Promise<string> => {
        try {
            const response = await fetch('/askNASAExpert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    question: userMessage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                return data.data.expert_response;
            } else {
                return `Lo siento, hubo un error al procesar tu pregunta: ${data.message}`;
            }
        } catch (error) {
            console.error('Error calling NASA Expert API:', error);
            return "Lo siento, no pude conectarme con el sistema de IA en este momento. Por favor, intenta de nuevo más tarde. 🤖";
        }
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
        const currentMessage = inputMessage
        setInputMessage('')
        setIsTyping(true)

        try {
            // Get bot response from Gemini API
            const botResponseText = await getBotResponse(currentMessage)
            
            const botResponse: Message = {
                id: messages.length + 2,
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
        } catch (error) {
            console.error('Error getting bot response:', error)
            const errorResponse: Message = {
                id: messages.length + 2,
                text: "Lo siento, hubo un problema técnico. Por favor, intenta de nuevo. 🤖",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorResponse])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Quick question suggestions
    const quickQuestions = [
        "¿Qué significa f_atm en mi simulación?",
        "¿Cómo se calcula la energía de impacto?",
        "¿Qué es la ablación atmosférica?",
        "Explícame los efectos de fragmentación",
        "¿Cómo funciona la simulación de cráteres?"
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
                    <p className="text-sm text-gray-400 mb-3">Prueba preguntando:</p>
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
                                placeholder="Pregúntame sobre simulaciones, física espacial, asteroides..."
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
                            <span>Enviar</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        NASAbot ahora está conectado con Google Gemini AI y listo para ayudarte con simulaciones espaciales! 🚀
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NasaBot
