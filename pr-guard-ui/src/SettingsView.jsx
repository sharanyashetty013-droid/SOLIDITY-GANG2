import { useState } from 'react'
import { Cpu, Server, KeyRound, SlidersHorizontal, ListChecks, Users, Gauge, Save, Check } from 'lucide-react'

const ruleList = [
  'Install or build hook changes',
  'New or changed dependencies',
  'New network calls or hard-coded URLs',
  'Dynamic execution (eval, exec, obfuscation)',
  'Access to env vars, tokens or credential files',
  'Large changes unrelated to the PR title',
  'Binary or minified files added',
]

function Toggle({ on, onChange }) {
  return (
    <button type="button" className={'toggle ' + (on ? 'on' : '')} aria-pressed={on} onClick={() => onChange(!on)}>
      <i />
    </button>
  )
}

function Head({ icon: Icon, title, tone }) {
  return (
    <div className="shead">
      <span className={'sico ' + tone}><Icon size={17} /></span>
      <h3>{title}</h3>
    </div>
  )
}

export default function SettingsView() {
  const [size, setSize] = useState('3b')
  const [host, setHost] = useState('http://localhost:11434')
  const [token, setToken] = useState('')
  const [medAt, setMedAt] = useState(30)
  const [highAt, setHighAt] = useState(60)
  const [rulesOn, setRulesOn] = useState(ruleList.map(() => true))
  const [trustOn, setTrustOn] = useState(true)
  const [cacheOn, setCacheOn] = useState(true)
  const [allow, setAllow] = useState('')
  const [saved, setSaved] = useState(false)

  const flip = (i, v) => setRulesOn((r) => r.map((x, j) => (j === i ? v : x)))
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="settings">
      <section className="card">
        <Head icon={Cpu} title="AI model" tone="g" />
        <p className="muted">The model only explains the findings. It never decides the score.</p>
        <div className="model on static">
          <b>Qwen2.5-Coder</b>
          <small>Runs locally through Ollama. Strong at reading code diffs.</small>
          <code>model: "qwen2.5-coder:{size}"</code>
          <i className="check"><Check size={14} /></i>
        </div>
        <label className="flabel">Model size</label>
        <select className="pill full" value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="1.5b">1.5b (fastest, lighter laptops)</option>
          <option value="3b">3b (balanced)</option>
          <option value="7b">7b (best quality, slower)</option>
        </select>
      </section>

      <section className="card">
        <Head icon={Server} title="Local model server" tone="p" />
        <p className="muted">Ollama runs on your machine, so no code leaves it.</p>
        <input className="search full" value={host} onChange={(e) => setHost(e.target.value)} />
        <div className="status"><span className="live" /> Local only. Nothing is sent to the cloud.</div>
      </section>

      <section className="card">
        <Head icon={KeyRound} title="GitHub access" tone="k" />
        <p className="muted">Only the GitHub data this token can already access is used.</p>
        <input className="search full" type="password" placeholder="Paste a GitHub token" value={token} onChange={(e) => setToken(e.target.value)} />
        <p className="hint">A token also avoids GitHub API rate limits.</p>
      </section>

      <section className="card">
        <Head icon={Gauge} title="Risk sensitivity" tone="g" />
        <p className="muted">Where a score becomes Medium or High.</p>
        <div className="slider">
          <label><span>Medium starts at</span><b>{medAt}</b></label>
          <input type="range" min="10" max="90" value={medAt} onChange={(e) => { const v = +e.target.value; setMedAt(v); if (v >= highAt) setHighAt(Math.min(v + 5, 100)) }} />
        </div>
        <div className="slider">
          <label><span>High starts at</span><b>{highAt}</b></label>
          <input type="range" min="15" max="100" value={highAt} onChange={(e) => { const v = +e.target.value; setHighAt(v); if (v <= medAt) setMedAt(Math.max(v - 5, 10)) }} />
        </div>
      </section>

      <section className="card span2">
        <Head icon={ListChecks} title="Risk rules" tone="p" />
        <p className="muted">Choose which code patterns the rules engine looks for.</p>
        <div className="rules">
          {ruleList.map((r, i) => (
            <div key={r} className="rule">
              <span>{r}</span>
              <Toggle on={rulesOn[i]} onChange={(v) => flip(i, v)} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <Head icon={SlidersHorizontal} title="Signals and speed" tone="k" />
        <div className="rule">
          <span>Use contributor context signals<small>They only nudge a score and never flag a PR alone.</small></span>
          <Toggle on={trustOn} onChange={setTrustOn} />
        </div>
        <div className="rule">
          <span>Cache scan results<small>Keeps repeat scans fast on a laptop.</small></span>
          <Toggle on={cacheOn} onChange={setCacheOn} />
        </div>
      </section>

      <section className="card">
        <Head icon={Users} title="Trusted contributors" tone="g" />
        <p className="muted">Usernames or bots to skip, one per line.</p>
        <textarea className="search full area" placeholder="dependabot" value={allow} onChange={(e) => setAllow(e.target.value)} />
      </section>

      <div className="savebar span2">
        {saved && <span className="saved"><Check size={14} /> Settings saved</span>}
        <button className="round dark big" onClick={save}><Save size={15} />&nbsp;Save settings</button>
      </div>
    </div>
  )
}