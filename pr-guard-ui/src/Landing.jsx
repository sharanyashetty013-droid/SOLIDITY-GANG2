import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ShieldCheck, FileSearch, Gauge, Users, Cpu, Heart } from 'lucide-react'
import { PrismIcon } from './Logo'

const steps = [
  ['01', 'Pick a repo', 'Choose the repository you maintain.'],
  ['02', 'Find first-time PRs', 'Open PRs from new contributors are picked out.'],
  ['03', 'Rules check the diff', 'Install hooks, new network calls, risky patterns.'],
  ['04', 'Evidence, not accusations', 'Every flag shows the exact file and line.'],
]

const features = [
  [FileSearch, 'Evidence first', 'Every flag points to the exact file and line that triggered it.'],
  [Users, 'First-time PR detection', 'Open PRs from contributors new to your repo are picked out automatically.'],
  [Gauge, 'Explainable risk score', 'Low, Medium or High, built from weighted findings you can inspect.'],
  [ShieldCheck, 'Trust signals, low weight', 'Account context only nudges a score and never flags a PR on its own.'],
  [Cpu, 'Runs on a local open model', 'Qwen2.5-Coder through Ollama, so your code stays on your machine.'],
  [Heart, 'Welcoming by design', 'Neutral wording and advisory only. The maintainer makes the final call.'],
]

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={'feat ' + (show ? 'in' : '')} style={{ transitionDelay: delay + 's' }}>
      {children}
    </div>
  )
}

export default function Landing({ onOpen }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const a = setTimeout(() => setStage(1), 2800)
    const b = setTimeout(() => setStage(2), 3600)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])

  return (
    <div className="landing">
      <nav className="lnav">
        <div className="nav-brand">
          <PrismIcon />
          <b className="wordmark">PRism</b>
        </div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="https://github.com/sharanyashetty013-droid/SOLIDITY-GANG2" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <div className="nav-right">
          <span className="nav-pill">FIRST-TIME PR GUARD</span>
          <button className="nav-btn" onClick={onOpen}>Open Console</button>
        </div>
      </nav>

      <div className={'hero ' + (stage >= 1 ? 'small' : '')}>
        <PrismIcon animate className="hero-icon" />
        <h1 className="wordmark hero-word">PRism</h1>
        <span className="hero-pill">FIRST-TIME PR GUARD</span>
      </div>

      {stage >= 1 && (
        <section className="how" id="how">
          <h2>How it works</h2>
          <div className="steps">
            {steps.map(([n, t, d], i) => (
              <div key={n} className="step" style={{ animationDelay: i * 0.15 + 's' }}>
                <span>{n}</span><h4>{t}</h4><p>{d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {stage >= 2 && (
        <button className="open" onClick={onOpen}>Open Console <ArrowRight size={16} /></button>
      )}

      {stage >= 1 && (
        <section className="features" id="features">
          <h2>Features</h2>
          <p className="fsub">Everything a maintainer needs to review new contributors safely.</p>
          <div className="fgrid">
            {features.map(([Icon, t, d], i) => (
              <Reveal key={t} delay={(i % 3) * 0.12}>
                <div className="ficon"><Icon size={22} /></div>
                <h4>{t}</h4>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}