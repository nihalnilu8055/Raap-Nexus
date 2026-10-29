import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import LiveDemoPage from './pages/LiveDemoPage'
import NotFound from './pages/NotFound'

function App() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <MotionConfig reducedMotion="never">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<LiveDemoPage />} />
        <Route path="/erp-demo" element={<LiveDemoPage />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MotionConfig>
  )
}

export default App
