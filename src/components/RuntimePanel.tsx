import { Brain, CheckCircle2, Cpu, Database, Gauge, Settings2, TerminalSquare } from 'lucide-react'

type RuntimePanelProps = {
  modelName: string
  runningModel: string
  think: boolean
  numCtx: number
  temperature: number
  onThinkChange: (think: boolean) => void
  onNumCtxChange: (numCtx: number) => void
  onTemperatureChange: (temperature: number) => void
}

export function RuntimePanel({
  modelName,
  runningModel,
  think,
  numCtx,
  temperature,
  onThinkChange,
  onNumCtxChange,
  onTemperatureChange,
}: RuntimePanelProps) {
  return (
    <aside className="runtime-panel">
      <section className="runtime-card model-card">
        <span className="model-orb">
          <Brain size={24} />
        </span>
        <div>
          <small>Local model</small>
          <h2>{modelName}</h2>
          <p>{runningModel}</p>
        </div>
      </section>

      <section className="runtime-card">
        <div className="section-heading">
          <Settings2 size={15} />
          Runtime
        </div>

        <label className="toggle-row">
          <span>
            Thinking
            <small>{think ? 'Stream and show reasoning panel' : 'Hidden and disabled in request'}</small>
          </span>
          <button className={`switch ${think ? 'on' : ''}`} type="button" onClick={() => onThinkChange(!think)}>
            <span />
          </button>
        </label>

        <label className="control-row">
          <span>Temperature</span>
          <output>{temperature.toFixed(2)}</output>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={temperature}
          onChange={(event) => onTemperatureChange(Number(event.target.value))}
        />

        <label className="control-row">
          <span>Context</span>
          <output>{numCtx.toLocaleString()}</output>
        </label>
        <input
          type="range"
          min="4096"
          max="16384"
          step="4096"
          value={numCtx}
          onChange={(event) => onNumCtxChange(Number(event.target.value))}
        />
      </section>

      <section className="runtime-card stat-list">
        <div><Cpu size={16} /><span>RTX 3050 / CPU hybrid</span></div>
        <div><Database size={16} /><span>D drive model storage</span></div>
        <div><Gauge size={16} /><span>Streaming markdown</span></div>
        <div><TerminalSquare size={16} /><span>Vite proxy to Ollama</span></div>
        <div><CheckCircle2 size={16} /><span>Thinking panel appears only with real thinking text</span></div>
      </section>
    </aside>
  )
}
