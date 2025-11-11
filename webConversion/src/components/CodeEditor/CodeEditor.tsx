/**
 * Code Editor Component
 * IL Program editor with uppercase conversion and line numbers
 * Converted from src/screens/HomePg.java text area with UpperCaseDocumentFilter
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { ExecutionMode } from '../../types/plc';
import './CodeEditor.css';

export function CodeEditor() {
  const { t } = useTranslation();
  const { state, dispatch } = usePLCState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Update line count when program text changes
  useEffect(() => {
    const lines = state.programText.split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [state.programText]);

  // Handle text change with uppercase conversion
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart;
    const uppercaseText = e.target.value.toUpperCase();

    dispatch({
      type: 'SET_PROGRAM_TEXT',
      programText: uppercaseText
    });

    // Restore cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursorPosition;
        textareaRef.current.selectionEnd = cursorPosition;
      }
    }, 0);
  };

  // Sync scroll between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersEl = document.querySelector('.code-editor__line-numbers');
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Handle tab key to insert spaces instead of changing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;

      // Insert 2 spaces at cursor position
      const newValue = value.substring(0, start) + '  ' + value.substring(end);

      dispatch({
        type: 'SET_PROGRAM_TEXT',
        programText: newValue
      });

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const isDisabled = state.mode === ExecutionMode.RUNNING;

  return (
    <div className="code-editor">
      <div className="code-editor__header">
        <h2 className="code-editor__title">{t('editor.title')}</h2>
        {isDisabled && (
          <span className="code-editor__warning">
            {t('editor.disabledWhileRunning')}
          </span>
        )}
      </div>

      <div className="code-editor__container">
        {/* Line Numbers */}
        <div className="code-editor__line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="code-editor__line-number">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          className="code-editor__textarea"
          value={state.programText}
          onChange={handleTextChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={t('editor.placeholder')}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      <div className="code-editor__footer">
        <span className="code-editor__info">
          {t('editor.lines')}: {lineCount} | {t('editor.characters')}: {state.programText.length}
        </span>
      </div>
    </div>
  );
}
