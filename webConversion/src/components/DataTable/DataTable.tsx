/**
 * Data Table Component
 * Shows all memory variables (timers and counters) with their values
 * Converted from src/screens/TabelaDados.java
 */

import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import type { MemoryVariable } from '../../types/plc';
import './DataTable.css';

interface DataTableProps {
  onClose: () => void;
}

export function DataTable({ onClose }: DataTableProps) {
  const { t } = useTranslation();
  const { state } = usePLCState();

  const getVariableTypeLabel = (variable: MemoryVariable): string => {
    if (variable.type === 'TIMER') {
      return variable.timerType === 'TON' ? 'TON' : 'TOFF';
    } else if (variable.type === 'COUNTER') {
      return variable.counterType === 'CTU' ? 'CTU' : 'CTD';
    } else {
      return 'M';
    }
  };

  const formatValue = (variable: MemoryVariable): string => {
    return variable.currentValue ? '1' : '0';
  };

  // Convert Record to array for iteration
  const memoryVariablesArray = Object.values(state.memoryVariables);

  return (
    <div className="data-table-overlay" onClick={onClose}>
      <div className="data-table" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="data-table__header">
          <h2 className="data-table__title">{t('dataTable.title')}</h2>
          <button className="data-table__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="data-table__content">
          <table className="data-table__table">
            <thead>
              <tr>
                <th>{t('dataTable.variable')}</th>
                <th>{t('dataTable.type')}</th>
                <th>{t('dataTable.value')}</th>
                <th>{t('dataTable.preset')}</th>
                <th>{t('dataTable.accumulated')}</th>
                <th>EN</th>
                <th>DN</th>
              </tr>
            </thead>
            <tbody>
              {memoryVariablesArray.length === 0 ? (
                <tr>
                  <td colSpan={7} className="data-table__empty">
                    {t('dataTable.noVariables')}
                  </td>
                </tr>
              ) : (
                memoryVariablesArray.map((variable) => (
                  <tr key={variable.id}>
                    <td className="data-table__variable">{variable.id}</td>
                    <td className="data-table__type">{getVariableTypeLabel(variable)}</td>
                    <td className={`data-table__value ${variable.currentValue ? 'active' : ''}`}>
                      {formatValue(variable)}
                    </td>
                    <td className="data-table__preset">{variable.preset}</td>
                    <td className="data-table__accumulated">{variable.accumulated}</td>
                    <td className={`data-table__flag ${variable.enabled ? 'active' : ''}`}>
                      {variable.enabled ? '1' : '0'}
                    </td>
                    <td className={`data-table__flag ${variable.done ? 'active' : ''}`}>
                      {variable.done ? '1' : '0'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="data-table__footer">
          <p className="data-table__info">
            {t('dataTable.count')}: {memoryVariablesArray.length}
          </p>
          <button className="data-table__button" onClick={onClose}>
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
