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

    const getStrategyIcon = (strategy: string): React.ReactNode => {
        const icons: { [key: string]: React.ReactNode } = {
            'kinetic': (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            'gravity-tractor': (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'nuclear': (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            'laser': (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        }
        return icons[strategy] || (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
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

    const getThreatIcon = (level: string): React.ReactNode => {
        // Retorna componente SVG en lugar de emoji
        const icons: { [key: string]: React.ReactNode } = {
            'Insignificante': (
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ),
            'Bajo': (
                <svg className="w-8 h-8 text-lime-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ),
            'Moderado': (
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            ),
            'Alto': (
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            ),
            'Muy Alto': (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            ),
            'Catastrófico': (
                <svg className="w-8 h-8 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            )
        }
        return icons[level] || (
            <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        )
    }

    if (!impactData) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Diseño Profesional */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">AI Impact Analysis & Defense</h2>
                                <p className="text-slate-300 text-sm mt-0.5 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Powered by Google Gemini
                                </p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition text-slate-300 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Threat Level Badge - Diseño Profesional */}
                    <div className="px-6 pt-6 pb-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {getThreatIcon(threatLevel)}
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Threat Assessment</p>
                                    <p className="text-2xl font-bold mt-0.5" style={{ color: getThreatColor(threatLevel) }}>
                                        {threatLevel}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Target Asteroid</p>
                                <p className="text-xl font-bold text-slate-900 mt-0.5">{impactData.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                                </div>
                                <p className="text-slate-600 text-base font-medium">Analyzing impact with AI...</p>
                                <p className="text-slate-400 text-sm">Processing orbital mechanics and threat assessment</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                                <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-red-700 font-semibold text-lg mb-1">Analysis Error</p>
                                <p className="text-red-600 text-sm mb-4">{error}</p>
                                <button
                                    onClick={fetchAnalysis}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium shadow-sm"
                                >
                                    Retry Analysis
                                </button>
                            </div>
                        )}

                        {!loading && !error && analysis && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="prose prose-slate prose-base max-w-none"
                            >
                                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-slate-900" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-slate-800" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-700" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-3 text-slate-600 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 text-slate-600 space-y-1.5" {...props} />,
                                            li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-slate-900 font-semibold" {...props} />,
                                        }}
                                    >
                                        {analysis}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        )}

                        {/* PLANETARY DEFENSE SIMULATOR - Diseño Profesional */}
                        {!loading && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Planetary Defense Simulator</h3>
                                            <p className="text-slate-500 text-sm mt-0.5">Test deflection strategies to save Earth</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDefense(!showDefense)}
                                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition text-white shadow-sm"
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
                                        {/* Lead Time Slider - Diseño Profesional */}
                                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <label className="text-slate-900 font-semibold text-sm">
                                                    Detection Lead Time: <span className="text-green-600">{leadTime} years</span> before impact
                                                </label>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={leadTime}
                                                onChange={(e) => setLeadTime(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                                <span>1 yr (Emergency)</span>
                                                <span>5 yrs (Ideal)</span>
                                                <span>10 yrs (Optimal)</span>
                                            </div>
                                        </div>

                                        {/* Strategy Cards - Diseño Profesional */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['kinetic', 'gravity-tractor', 'nuclear', 'laser'].map((strategy) => (
                                                <button
                                                    key={strategy}
                                                    onClick={() => simulateDefense(strategy)}
                                                    disabled={simulatingDefense}
                                                    className={`p-5 rounded-lg border-2 transition-all ${
                                                        selectedStrategy === strategy
                                                            ? 'border-green-600 bg-green-50 shadow-sm'
                                                            : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50'
                                                    } ${simulatingDefense ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                                                >
                                                    <div className="text-slate-700 mb-3 flex justify-center">{getStrategyIcon(strategy)}</div>
                                                    <div className="font-semibold text-slate-900 text-xs text-center">
                                                        {getStrategyName(strategy)}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Compare Button - Diseño Profesional */}
                                        <button
                                            onClick={compareAllStrategies}
                                            disabled={simulatingDefense}
                                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Compare All Strategies
                                        </button>

                                        {/* Loading - Diseño Profesional */}
                                        {simulatingDefense && (
                                            <div className="bg-slate-50 rounded-lg p-6 text-center border border-slate-200">
                                                <div className="inline-block w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <p className="text-slate-700 font-medium">Calculating orbital deflection physics...</p>
                                                <p className="text-slate-500 text-sm mt-1">Running NASA DART-based simulation</p>
                                            </div>
                                        )}

                                        {/* Single Result - Diseño Profesional */}
                                        {deflectionResult && !showComparison && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`rounded-lg p-6 border-2 shadow-lg ${
                                                    deflectionResult.earth_saved
                                                        ? 'bg-green-50 border-green-600'
                                                        : 'bg-red-50 border-red-600'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center ${
                                                        deflectionResult.earth_saved ? 'bg-green-100' : 'bg-red-100'
                                                    }">
                                                        {deflectionResult.earth_saved ? (
                                                            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-bold ${
                                                            deflectionResult.earth_saved ? 'text-green-900' : 'text-red-900'
                                                        }">
                                                            {deflectionResult.earth_saved ? 'EARTH SAVED!' : 'IMPACT IMMINENT'}
                                                        </h4>
                                                        <p className="text-slate-600 text-sm font-medium">
                                                            {getStrategyName(selectedStrategy || '')} · {leadTime} year lead time
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                                        <p className="text-slate-500 text-xs mb-1 font-medium">Delta-V Applied</p>
                                                        <p className="text-slate-900 font-bold text-sm">
                                                            {deflectionResult.deltaV_cms?.toFixed(4)} cm/s
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                                        <p className="text-slate-500 text-xs mb-1 font-medium">Miss Distance</p>
                                                        <p className="text-slate-900 font-bold text-sm">
                                                            {deflectionResult.miss_distance_km?.toLocaleString()} km
                                                        </p>
                                                        <p className="text-slate-500 text-xs">
                                                            {deflectionResult.miss_distance_earth_radii?.toFixed(1)}× Earth radius
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                                        <p className="text-slate-500 text-xs mb-1 font-medium">Mission Cost</p>
                                                        <p className="text-slate-900 font-bold text-sm">
                                                            ${deflectionResult.cost_billion_usd}B
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                                        <p className="text-slate-500 text-xs mb-1 font-medium">Success Rate</p>
                                                        <p className="text-slate-900 font-bold text-sm">
                                                            {(deflectionResult.success_probability * 100).toFixed(0)}%
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                                        <p className="text-slate-500 text-xs mb-1 font-medium">Deflection Angle</p>
                                                        <p className="text-slate-900 font-bold text-sm">
                                                            {deflectionResult.deflection_angle_arcsec?.toFixed(2)}″
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                                        <p className="text-slate-500 text-xs mb-1 font-medium">Safety Level</p>
                                                        <p className="text-slate-900 font-bold text-xs">
                                                            {deflectionResult.safety_level}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 space-y-2 border border-slate-200 shadow-sm">
                                                    <p className="text-slate-900 text-xs font-bold uppercase tracking-wide">Mission Details</p>
                                                    <p className="text-slate-700 text-sm">{deflectionResult.description}</p>
                                                    <div className="pt-2 space-y-1 text-xs">
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <p className="text-green-700 font-medium">{deflectionResult.advantages}</p>
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <p className="text-yellow-700 font-medium">{deflectionResult.disadvantages}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Comparison Results - Diseño Profesional */}
                                        {showComparison && comparisonResults && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-600 rounded-lg p-4 shadow-md">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-green-900 mb-1">
                                                                Recommended: {getStrategyName(comparisonResults.best_strategy.name)}
                                                            </h4>
                                                            <p className="text-green-800 text-sm">
                                                                {comparisonResults.best_strategy.reasoning}
                                                            </p>
                                                            <p className="text-green-700 text-xs mt-2 font-semibold">
                                                                Effectiveness Score: {comparisonResults.best_strategy.score}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(comparisonResults.comparisons).map(([strategy, result]: [string, any]) => (
                                                        <div
                                                            key={strategy}
                                                            className={`rounded-lg p-4 border-2 shadow-sm ${
                                                                result.earth_saved
                                                                    ? 'bg-green-50 border-green-500'
                                                                    : 'bg-red-50 border-red-500'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="text-slate-700">{getStrategyIcon(strategy)}</span>
                                                                <h5 className="font-bold text-slate-900 text-sm">{getStrategyName(strategy)}</h5>
                                                                <span className="ml-auto">
                                                                    {result.earth_saved ? (
                                                                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 font-medium">ΔV:</span>
                                                                    <span className="text-slate-900 font-bold">
                                                                        {result.deltaV_cms?.toFixed(3)} cm/s
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 font-medium">Miss:</span>
                                                                    <span className="text-slate-900 font-bold">
                                                                        {result.miss_distance_km?.toLocaleString()} km
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 font-medium">Cost:</span>
                                                                    <span className="text-slate-900 font-bold">
                                                                        ${result.cost_billion_usd}B
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600 font-medium">Success:</span>
                                                                    <span className="text-slate-900 font-bold">
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
                                                    className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 transition text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                    </svg>
                                                    Back to Strategy Selection
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer - Diseño Profesional */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            <p className="text-slate-600 text-xs font-medium">
                                AI-powered analysis · Real physics calculations
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold transition text-sm text-white shadow-sm"
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
