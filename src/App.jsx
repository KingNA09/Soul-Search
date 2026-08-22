import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import './App.css'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Triad from './components/Triad'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import Login from './components/Login'
import Assessment from './components/Assessment'
import History from './components/History'

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Triad />
      <CTASection />
      <Footer />
    </>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  return <Login onAuthSuccess={() => navigate('/')} />
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null // or a spinner

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/assessment"
          element={session ? <Assessment /> : <Navigate to="/login" replace />}
        />
        <Route
         path ="/history"
          element={session ? <History /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App