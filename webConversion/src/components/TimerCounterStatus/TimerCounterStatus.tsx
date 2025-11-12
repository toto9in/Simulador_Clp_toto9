/**
 * Timer and Counter Status Display
 * Shows real-time status of all timers and counters
 */

import { usePLCState } from '../../context/PLCStateContext';
import './TimerCounterStatus.css';

export function TimerCounterStatus() {
  const { state } = usePLCState();

  // Get all timers and counters from memory variables
  const timers = Object.values(state.memoryVariables).filter(v => v.type === 'TIMER');
  const counters = Object.values(state.memoryVariables).filter(v => v.type === 'COUNTER');
  const memories = Object.values(state.memoryVariables).filter(v => v.type === 'MEMORY');

  return (
    <div className="timer-counter-status">
      <div className="status-section">
        <h3 className="status-section__title">Timers ({timers.length})</h3>
        {timers.length === 0 ? (
          <div className="status-empty">Nenhum timer em uso</div>
        ) : (
          <div className="status-grid">
            {timers.map((timer) => (
              <div key={timer.id} className={`status-item ${timer.done ? 'status-item--active' : ''}`}>
                <div className="status-item__header">
                  <span className="status-item__id">{timer.id}</span>
                  <span className={`status-item__badge ${timer.done ? 'status-item__badge--done' : ''}`}>
                    {timer.timerType}
                  </span>
                </div>
                <div className="status-item__body">
                  <div className="status-row">
                    <span className="status-label">EN:</span>
                    <span className={`status-value ${timer.currentValue ? 'status-value--on' : ''}`}>
                      {timer.currentValue ? '1' : '0'}
                    </span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">ACC:</span>
                    <span className="status-value">{timer.accumulated}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">PRE:</span>
                    <span className="status-value">{timer.preset}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">DN:</span>
                    <span className={`status-value ${timer.done ? 'status-value--done' : ''}`}>
                      {timer.done ? '1' : '0'}
                    </span>
                  </div>
                </div>
                <div className="status-progress">
                  <div
                    className="status-progress__bar"
                    style={{
                      width: `${Math.min(100, (timer.accumulated / timer.preset) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="status-section">
        <h3 className="status-section__title">Counters ({counters.length})</h3>
        {counters.length === 0 ? (
          <div className="status-empty">Nenhum contador em uso</div>
        ) : (
          <div className="status-grid">
            {counters.map((counter) => (
              <div key={counter.id} className={`status-item ${counter.done ? 'status-item--active' : ''}`}>
                <div className="status-item__header">
                  <span className="status-item__id">{counter.id}</span>
                  <span className={`status-item__badge ${counter.done ? 'status-item__badge--done' : ''}`}>
                    {counter.counterType}
                  </span>
                </div>
                <div className="status-item__body">
                  <div className="status-row">
                    <span className="status-label">CU:</span>
                    <span className={`status-value ${counter.currentValue ? 'status-value--on' : ''}`}>
                      {counter.currentValue ? '1' : '0'}
                    </span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">ACC:</span>
                    <span className="status-value">{counter.accumulated}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">PRE:</span>
                    <span className="status-value">{counter.preset}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">DN:</span>
                    <span className={`status-value ${counter.done ? 'status-value--done' : ''}`}>
                      {counter.done ? '1' : '0'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {memories.length > 0 && (
        <div className="status-section">
          <h3 className="status-section__title">Memory ({memories.length})</h3>
          <div className="status-grid status-grid--compact">
            {memories.map((mem) => (
              <div key={mem.id} className={`status-item status-item--compact ${mem.currentValue ? 'status-item--active' : ''}`}>
                <span className="status-item__id">{mem.id}</span>
                <span className={`status-value ${mem.currentValue ? 'status-value--on' : ''}`}>
                  {mem.currentValue ? '1' : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
