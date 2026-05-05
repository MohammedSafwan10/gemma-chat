import { Loader2, Wifi, WifiOff } from 'lucide-react'
import type { OllamaStatus } from '../types/chat'

type StatusBadgeProps = {
  status: OllamaStatus
  runningModel: string
}

export function StatusBadge({ status, runningModel }: StatusBadgeProps) {
  return (
    <div className={`status-pill ${status}`} title={runningModel}>
      {status === 'online' ? (
        <Wifi size={15} />
      ) : status === 'offline' ? (
        <WifiOff size={15} />
      ) : (
        <Loader2 size={15} className="spin" />
      )}
      {status === 'online' ? 'Ollama online' : status === 'offline' ? 'Offline' : 'Checking'}
    </div>
  )
}
