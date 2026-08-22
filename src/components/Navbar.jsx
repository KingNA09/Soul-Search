import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#triad', label: 'The triad' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 780) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    navigate('/')
  }

  const fullName = session?.user?.user_metadata?.full_name

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true" />
          Soul Search
        </Link>

        <div className="nav-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}

          {session ? (
            <>
              <span className="nav-user">Logged in as {fullName || session.user.email}</span>
              <button type="button" className="nav-cta" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-cta">
              Log in
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`nav-toggle ${menuOpen ? 'nav-toggle-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-mobile ${menuOpen ? 'nav-mobile-open' : ''}`}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
        {session ? (
          <>
            <span className="nav-user">Logged in as {fullName|| session.user.email}</span>
            <button type="button" className="nav-cta" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-cta" onClick={() => setMenuOpen(false)}>
            Log in
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar