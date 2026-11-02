import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import LangRoute, { RootRedirect } from './components/layout/LangRoute'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:lang" element={<LangRoute />} />
        <Route path="/:lang/*" element={<LangRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MotionConfig>
  )
}
