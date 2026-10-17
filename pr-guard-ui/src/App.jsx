import { useState } from 'react'
import Landing from './Landing'
import Dashboard from './Dashboard'

export default function App() {
  const [view, setView] = useState('landing')
  return view === 'landing'
    ? <Landing onOpen={() => setView('console')} />
    : <Dashboard onHome={() => setView('landing')} />
}