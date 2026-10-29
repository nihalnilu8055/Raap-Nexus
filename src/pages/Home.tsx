import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import InteractiveAgentDemo from '../components/InteractiveAgentDemo'
import RadialApplicationSuite from '../components/RadialApplicationSuite'
import PinnedWorkflow from '../components/PinnedWorkflow'
import SovereigntyPipeline from '../components/SovereigntyPipeline'
import FinalCta from '../components/FinalCta'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 w-full overflow-x-hidden">
      {/* Top Floating Sticky Navigation with Large Sharp Logo */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* 1. Hero Section: Full-Width, 3D Floating ERP Perspective, Staggered Typography, Dual CTAs */}
        <HeroSection />

        {/* 2. Reference A: Interactive Demo Workbench with 4 Agents, Live Execution, and Generated Ledger */}
        <InteractiveAgentDemo />

        {/* 3. Reference B: Application Suite Radial Constellation with SVG Orbit & Staggered Modules */}
        <RadialApplicationSuite />

        {/* 4. Pinned Scroll Storytelling with GSAP ScrollTrigger */}
        <PinnedWorkflow />

        {/* 5. Reference C: Multi-LLM & Data Sovereignty 3-Node Architecture Pipeline */}
        <SovereigntyPipeline />

        {/* 6. Final Executive Demonstration Booking */}
        <FinalCta />
      </main>

      {/* Clean Full-Width Minimal Footer */}
      <Footer />
    </div>
  )
}
