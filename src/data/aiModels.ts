import { Bot, Brain, Gem, HardDrive, Plug, Wind, type LucideIcon } from 'lucide-react'

/**
 * Integration status is conservative and verified against the project:
 * VERIFIED = working today. RaapNexus exposes the ERP through an MCP (Model Context Protocol) connector
 *            and Anthropic Claude is connected to it.
 * CONCEPT  = shown as a possibility only; nothing here is presented as operational.
 */
export interface AiNode {
  id: string
  name: string
  short: string
  status: 'verified' | 'concept'
  statusLabel: string
  blurb: string
  env: 'cloud' | 'private' | 'local' | 'custom'
  Icon: LucideIcon
  color: string
  logo?: string
}

export const AI_NODES: AiNode[] = [
  { id: 'claude', name: 'Anthropic Claude', short: 'Claude', status: 'verified', statusLabel: 'Connected via MCP', blurb: 'Ask your financial data in natural language.', env: 'cloud', Icon: Bot, color: '#D97757', logo: '/assets/providers/claude.svg' },
  { id: 'openai', name: 'OpenAI', short: 'OpenAI', status: 'concept', statusLabel: 'Coming soon', blurb: 'Hosted model option.', env: 'cloud', Icon: Brain, color: '#10A37F', logo: '/assets/providers/openai.svg' },
  { id: 'gemini', name: 'Google Gemini', short: 'Gemini', status: 'concept', statusLabel: 'Coming soon', blurb: 'Hosted model option.', env: 'cloud', Icon: Gem, color: '#4285F4', logo: '/assets/providers/gemini.svg' },
  { id: 'mistral', name: 'Mistral', short: 'Mistral', status: 'concept', statusLabel: 'Coming soon', blurb: 'Hosted model option.', env: 'cloud', Icon: Wind, color: '#FA520F', logo: '/assets/providers/mistral.svg' },
  { id: 'local', name: 'Ollama (local models)', short: 'Ollama', status: 'concept', statusLabel: 'Coming soon', blurb: 'Local models on your own hardware.', env: 'local', Icon: HardDrive, color: '#94A3B8', logo: '/assets/providers/ollama.svg' },
  { id: 'custom', name: 'Custom integration', short: 'Custom', status: 'concept', statusLabel: 'Coming soon', blurb: 'Bring your own model.', env: 'custom', Icon: Plug, color: '#818cf8' },
]

export const USE_CASES = [
  { id: 'tax', label: 'Tax document analysis', prompt: 'Summarise our VAT position for this quarter.' },
  { id: 'report', label: 'Financial report analysis', prompt: "Explain the main drivers of this month's profit." },
  { id: 'txn', label: 'Transaction review', prompt: 'List transactions above AED 50,000 with no matching entry.' },
  { id: 'exp', label: 'Expense pattern analysis', prompt: 'Which expense accounts changed most versus last quarter?' },
  { id: 'perf', label: 'Business performance', prompt: 'How did sales growth compare with margin this year?' },
  { id: 'anom', label: 'Anomaly identification', prompt: 'Flag one-off swings in monthly ledger balances.' },
]
