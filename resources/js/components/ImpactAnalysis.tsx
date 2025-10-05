// ImpactAnalysis.tsx - Análisis inteligente post-simulación con Gemini AI
// Muestra análisis detallado del impacto, comparaciones históricas y DEFLECTION STRATEGIES

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
    
    // Deflection simulator states
    const [showDefense, setShowDefense] = useState(false)
    const [deflectionResult, setDeflectionResult] = useState<any>(null)
    const [simulatingDefense, setSimulatingDefense] = useState(false)
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
    const [leadTime, setLeadTime] = useState(5)
    const [showComparison, setShowComparison] = useState(false)
    const [comparisonResults, setComparisonResults] = useState<any>(null)

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

    const simulateDefense = async (strategy: string) => {
        setSimulatingDefense(true)
        setSelectedStrategy(strategy)
        setDeflectionResult(null)
        setShowComparison(false)
        
        try {
            const response = await fetch('/simulateDeflection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    impactData: impactData,
                    strategy: strategy,
                    leadTime: leadTime
                })
            })

            const data = await response.json()

            if (data.success) {
                setDeflectionResult(data.results)
            }
        } catch (err: any) {
            console.error('Error simulating defense:', err)
        } finally {
            setSimulatingDefense(false)
        }
    }

    const compareAllStrategies = async () => {
        setSimulatingDefense(true)
        setShowComparison(true)
        setDeflectionResult(null)
        
        try {
            const response = await fetch('/compareStrategies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    impactData: impactData,
                    leadTime: leadTime
                })
            })

            const data = await response.json()

            if (data.success) {
                setComparisonResults(data)
            }
        } catch (err: any) {
            console.error('Error comparing strategies:', err)
        } finally {
            setSimulatingDefense(false)
        }
    }

    const getStrategyIcon = (strategy: string) => {
        const icons: { [key: string]: string } = {
            'kinetic': '🚀',
            'gravity-tractor': '🛰️',
            'nuclear': '☢️',
            'laser': '🔬'
        }
        return icons[strategy] || '🛡️'
    }

    const getStrategyName = (strategy: string) => {
        const names: { [key: string]: string } = {
            'kinetic': 'Kinetic Impactor',
            'gravity-tractor': 'Gravity Tractor',
            'nuclear': 'Nuclear Standoff',
            'laser': 'Laser Ablation'
        }
        return names[strategy] || strategy
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
                                <h2 className="text-3xl font-bold text-white">AI Impact Analysis & Defense</h2>
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
                                    <p className="text-gray-400 text-sm">Threat Level</p>
                                    <p className="text-2xl font-bold" style={{ color: getThreatColor(threatLevel) }}>
                                        {threatLevel}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Asteroid</p>
                                <p className="text-xl font-bold text-white">{impactData.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                                </div>
                                <p className="text-gray-300 text-lg text-center">Analyzing impact with AI...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
                                <p className="text-red-400 text-lg">⚠️ {error}</p>
                                <button
                                    onClick={fetchAnalysis}
                                    className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                                >
                                    Retry
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
                                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-blue-400" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-purple-400" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-3 text-gray-300 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 text-gray-300 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                        }}
                                    >
                                        {analysis}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        )}

                        {/* PLANETARY DEFENSE SIMULATOR */}
                        {!loading && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl border-2 border-green-500/30 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                                            🛡️
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Planetary Defense Simulator</h3>
                                            <p className="text-gray-400 text-sm">Test deflection strategies to save Earth</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDefense(!showDefense)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition text-white"
                                    >
                                        {showDefense ? 'Hide' : 'Activate'} Defense
                                    </button>
                                </div>

                                {showDefense && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-6"
                                    >
                                        {/* Lead Time Slider */}
                                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                            <label className="text-white font-semibold mb-2 block">
                                                🕐 Detection Lead Time: {leadTime} years before impact
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={leadTime}
                                                onChange={(e) => setLeadTime(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>1 yr (Emergency)</span>
                                                <span>5 yrs (Ideal)</span>
                                                <span>10 yrs (Optimal)</span>
                                            </div>
                                        </div>

                                        {/* Strategy Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['kinetic', 'gravity-tractor', 'nuclear', 'laser'].map((strategy) => (
                                                <button
                                                    key={strategy}
                                                    onClick={() => simulateDefense(strategy)}
                                                    disabled={simulatingDefense}
                                                    className={`p-4 rounded-lg border-2 transition ${
                                                        selectedStrategy === strategy
                                                            ? 'border-green-500 bg-green-500/20'
                                                            : 'border-gray-600 bg-gray-800/50 hover:border-green-500/50'
                                                    } ${simulatingDefense ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="text-3xl mb-2">{getStrategyIcon(strategy)}</div>
                                                    <div className="font-bold text-white text-xs">
                                                        {getStrategyName(strategy)}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Compare Button */}
                                        <button
                                            onClick={compareAllStrategies}
                                            disabled={simulatingDefense}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-white transition disabled:opacity-50"
                                        >
                                            📊 Compare All Strategies
                                        </button>

                                        {/* Loading */}
                                        {simulatingDefense && (
                                            <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                                                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                                <p className="text-gray-300">Calculating orbital deflection physics...</p>
                                            </div>
                                        )}

                                        {/* Single Result */}
                                        {deflectionResult && !showComparison && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`rounded-lg p-6 border-2 ${
                                                    deflectionResult.earth_saved
                                                        ? 'bg-green-900/30 border-green-500'
                                                        : 'bg-red-900/30 border-red-500'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="text-5xl">
                                                        {deflectionResult.earth_saved ? '✅' : '❌'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-bold text-white">
                                                            {deflectionResult.earth_saved ? 'EARTH SAVED!' : 'IMPACT IMMINENT'}
                                                        </h4>
                                                        <p className="text-gray-300 text-sm">
                                                            {getStrategyName(selectedStrategy || '')} · {leadTime} year lead time
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                                    <div className="bg-black/30 rounded p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Delta-V Applied</p>
                                                        <p className="text-white font-bold text-sm">
                                                            {deflectionResult.deltaV_cms?.toFixed(4)} cm/s
                                                        </p>
                                                    </div>
                                                    <div className="bg-black/30 rounded p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Miss Distance</p>
                                                        <p className="text-white font-bold text-sm">
                                                            {deflectionResult.miss_distance_km?.toLocaleString()} km
                                                        </p>
                                                        <p className="text-gray-400 text-xs">
                                                            {deflectionResult.miss_distance_earth_radii?.toFixed(1)}× Earth radius
                                                        </p>
                                                    </div>
                                                    <div className="bg-black/30 rounded p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Mission Cost</p>
                                                        <p className="text-white font-bold text-sm">
                                                            ${deflectionResult.cost_billion_usd}B
                                                        </p>
                                                    </div>
                                                    <div className="bg-black/30 rounded p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Success Rate</p>
                                                        <p className="text-white font-bold text-sm">
                                                            {(deflectionResult.success_probability * 100).toFixed(0)}%
                                                        </p>
                                                    </div>
                                                    <div className="bg-black/30 rounded p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Deflection Angle</p>
                                                        <p className="text-white font-bold text-sm">
                                                            {deflectionResult.deflection_angle_arcsec?.toFixed(2)}″
                                                        </p>
                                                    </div>
                                                    <div className="bg-black/30 rounded p-3">
                                                        <p className="text-gray-400 text-xs mb-1">Safety Level</p>
                                                        <p className="text-white font-bold text-xs">
                                                            {deflectionResult.safety_level}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-black/30 rounded p-4 space-y-2">
                                                    <p className="text-gray-400 text-xs font-bold">MISSION DETAILS</p>
                                                    <p className="text-gray-300 text-sm">{deflectionResult.description}</p>
                                                    <div className="pt-2 space-y-1 text-xs">
                                                        <p className="text-green-400">✓ {deflectionResult.advantages}</p>
                                                        <p className="text-yellow-400">⚠ {deflectionResult.disadvantages}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Comparison Results */}
                                        {showComparison && comparisonResults && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
                                                    <h4 className="text-lg font-bold text-white mb-2">
                                                        🏆 Recommended: {getStrategyName(comparisonResults.best_strategy.name)}
                                                    </h4>
                                                    <p className="text-gray-300 text-sm">
                                                        {comparisonResults.best_strategy.reasoning}
                                                    </p>
                                                    <p className="text-blue-400 text-xs mt-2">
                                                        Effectiveness Score: {comparisonResults.best_strategy.score}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(comparisonResults.comparisons).map(([strategy, result]: [string, any]) => (
                                                        <div
                                                            key={strategy}
                                                            className={`rounded-lg p-4 border ${
                                                                result.earth_saved
                                                                    ? 'bg-green-900/20 border-green-600'
                                                                    : 'bg-red-900/20 border-red-600'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="text-2xl">{getStrategyIcon(strategy)}</span>
                                                                <h5 className="font-bold text-white text-sm">{getStrategyName(strategy)}</h5>
                                                                <span className="ml-auto text-xl">
                                                                    {result.earth_saved ? '✅' : '❌'}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-400">ΔV:</span>
                                                                    <span className="text-white font-bold">
                                                                        {result.deltaV_cms?.toFixed(3)} cm/s
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-400">Miss:</span>
                                                                    <span className="text-white font-bold">
                                                                        {result.miss_distance_km?.toLocaleString()} km
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-400">Cost:</span>
                                                                    <span className="text-white font-bold">
                                                                        ${result.cost_billion_usd}B
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-400">Success:</span>
                                                                    <span className="text-white font-bold">
                                                                        {(result.success_probability * 100).toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setShowComparison(false)
                                                        setComparisonResults(null)
                                                    }}
                                                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition text-sm"
                                                >
                                                    ← Back to Strategy Selection
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
                        <p className="text-gray-400 text-xs">
                            💡 AI-powered analysis · Real physics calculations
                        </p>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-semibold transition text-sm"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ImpactAnalysis
