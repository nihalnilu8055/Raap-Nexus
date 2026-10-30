import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MotionConfig>
  )
}
