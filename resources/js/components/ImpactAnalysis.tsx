// ImpactAnalysis.tsx - Análisis inteligente post-simulación con Gemini AI
// Muestra análisis detallado del impacto, comparaciones históricas y recomendaciones

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface ImpactAnalysisProps {
    impactData: any
    onClose?: () => void
}

const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ impactData, onClose }) => {
    const [analysis, setAnalysis] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [threatLevel, setThreatLevel] = useState<string>('Calculando...')

    useEffect(() => {
        if (impactData) {
            fetchAnalysis()
        }
    }, [impactData])

    const fetchAnalysis = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const response = await fetch('/analyzeImpact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    impactData: impactData
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                setAnalysis(data.data.analysis)
                setThreatLevel(data.data.impact_summary.threat_level)
            } else {
                throw new Error(data.message || 'Error al analizar el impacto')
            }
        } catch (err: any) {
            console.error('Error fetching analysis:', err)
            setError(err.message || 'No se pudo conectar con el sistema de IA')
        } finally {
            setLoading(false)
        }
    }

    const getThreatColor = (level: string) => {
        const colors: { [key: string]: string } = {
            'Insignificante': '#22c55e',
            'Bajo': '#84cc16',
            'Moderado': '#eab308',
            'Alto': '#f97316',
            'Muy Alto': '#ef4444',
            'Catastrófico': '#dc2626'
        }
        return colors[level] || '#64748b'
    }

    const getThreatIcon = (level: string) => {
        const icons: { [key: string]: string } = {
            'Insignificante': '✨',
            'Bajo': '🟢',
            'Moderado': '🟡',
            'Alto': '🟠',
            'Muy Alto': '🔴',
            'Catastrófico': '☢️'
        }
        return icons[level] || '⚠️'
    }

    if (!impactData) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
                                🤖
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">Análisis de Impacto con IA</h2>
                                <p className="text-blue-100 text-sm mt-1">Powered by Google Gemini</p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Threat Level Badge */}
                    <div className="px-6 pt-6 pb-4 bg-gray-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{getThreatIcon(threatLevel)}</span>
                                <div>
                                    <p className="text-gray-400 text-sm">Nivel de Amenaza</p>
                                    <p className="text-2xl font-bold" style={{ color: getThreatColor(threatLevel) }}>
                                        {threatLevel}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Meteorito</p>
                                <p className="text-xl font-bold text-white">{impactData.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                                </div>
                                <p className="text-gray-300 text-lg text-center">Analizando impacto con IA...</p>
                                <p className="text-gray-500 text-sm text-center">Comparando con eventos históricos y calculando efectos</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
                                <p className="text-red-400 text-lg">⚠️ {error}</p>
                                <button
                                    onClick={fetchAnalysis}
                                    className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {!loading && !error && analysis && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="prose prose-invert prose-lg max-w-none"
                            >
                                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-white" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-6 text-blue-400" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 mt-4 text-purple-400" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-4 text-gray-300 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                            em: ({ node, ...props }) => <em className="text-blue-300" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-gray-900 px-2 py-1 rounded text-green-400" {...props} />,
                                        }}
                                    >
                                        {analysis}
                                    </ReactMarkdown>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/50 rounded-lg p-4">
                                        <p className="text-blue-400 text-sm mb-1">Diámetro</p>
                                        <p className="text-white text-xl font-bold">
                                            {impactData.calculations?.diameter_m?.toFixed(0)} m
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-lg p-4">
                                        <p className="text-purple-400 text-sm mb-1">Energía</p>
                                        <p className="text-white text-xl font-bold">
                                            {impactData.calculations?.kinetic_energy_initial_megatons_tnt?.toFixed(2)} MT
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/50 rounded-lg p-4">
                                        <p className="text-green-400 text-sm mb-1">Cráter</p>
                                        <p className="text-white text-xl font-bold">
                                            {(impactData.atmospheric_impact?.crater_diameter_m / 1000)?.toFixed(2)} km
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            💡 Este análisis fue generado por IA y puede contener estimaciones
                        </p>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-semibold transition"
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ImpactAnalysis
