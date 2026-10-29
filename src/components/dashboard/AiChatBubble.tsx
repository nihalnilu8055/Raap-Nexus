import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface AiChatBubbleProps {
  question?: string
  answer?: string
  compact?: boolean
}

export default function AiChatBubble({ question, answer, compact = false }: AiChatBubbleProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!answer) return
    const timer = setTimeout(() => setShowAnswer(true), 600)
    return () => clearTimeout(timer)
  }, [answer])

  useEffect(() => {
    if (!showAnswer || !answer) return
    let i = 0
    const interval = setInterval(() => {
      setTyped(answer.slice(0, i + 1))
      i++
      if (i >= answer.length) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [showAnswer, answer])

  if (compact) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mt-0.5">
            <span className="text-[9px] text-slate-700 font-bold">U</span>
          </div>
          <div className="bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-800 max-w-[90%] font-medium">
            {question}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex-shrink-0 flex items-center justify-center mt-0.5">
            <Sparkles size={11} className="text-electric-blue" />
          </div>
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-900 max-w-[90%] leading-relaxed font-medium">
            {answer}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {question && (
        <motion.div
          className="flex items-start gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
            <span className="text-xs text-slate-700 font-bold">U</span>
          </div>
          <div className="bg-slate-100 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 max-w-[85%] font-medium shadow-2xs">
            {question}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            className="flex items-start gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex-shrink-0 flex items-center justify-center">
              <Sparkles size={13} className="text-electric-blue" />
            </div>
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 max-w-[85%] shadow-2xs font-medium leading-relaxed">
              {typed}
              {typed.length < (answer?.length ?? 0) && (
                <span className="animate-blink ml-0.5 text-electric-blue font-bold">|</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
