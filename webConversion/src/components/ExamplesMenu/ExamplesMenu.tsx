/**
 * Examples Menu Component
 * Dropdown menu to load example programs
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePLCState } from '../../context/PLCStateContext';
import { useToastContext } from '../../context/ToastContext';
import {
  fetchExamplesIndex,
  loadExample,
  groupExamplesByCategory,
  getCategoryName,
  type Example,
} from '../../services/examples';
import './ExamplesMenu.css';

interface ExamplesMenuProps {
  hasUnsavedChanges?: boolean;
  onResetSavedState?: (newProgram: string) => void;
  onLoadingChange?: (isLoading: boolean, message?: string) => void;
}

export function ExamplesMenu({
  hasUnsavedChanges = false,
  onResetSavedState,
  onLoadingChange,
}: ExamplesMenuProps) {
  const { t } = useTranslation();
  const { dispatch } = usePLCState();
  const toast = useToastContext();
  const [isOpen, setIsOpen] = useState(false);
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load examples index on mount
  useEffect(() => {
    const loadExamples = async () => {
      try {
        const index = await fetchExamplesIndex();
        setExamples(index.examples);
      } catch (error) {
        console.error('Failed to load examples:', error);
      }
    };
    loadExamples();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLoadExample = async (example: Example) => {
    // Warn if there are unsaved changes
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        `You have unsaved changes. Loading "${example.title}" will discard them. Continue?`
      );
      if (!confirmed) {
        setIsOpen(false);
        return;
      }
    }

    setLoading(true);
    if (onLoadingChange) onLoadingChange(true, `Loading example: ${example.title}...`);

    try {
      const programText = await loadExample(example.file);
      dispatch({ type: 'SET_PROGRAM_TEXT', programText });

      if (onResetSavedState) {
        onResetSavedState(programText);
      }

      toast.success(`Example loaded: ${example.title}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error loading example:', error);
      toast.error(`Failed to load example: ${example.title}`);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const groupedExamples = groupExamplesByCategory(examples);
  const categories = Object.keys(groupedExamples);

  return (
    <div className="examples-menu" ref={menuRef}>
      <button
        className="examples-menu__button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        📚 {t('menu.examples') || 'Examples'}
      </button>

      {isOpen && (
        <div className="examples-menu__dropdown">
          <div className="examples-menu__header">
            <span className="examples-menu__title">Load Example Program</span>
            <button
              className="examples-menu__close"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="examples-menu__content">
            {categories.length === 0 ? (
              <div className="examples-menu__empty">No examples available</div>
            ) : (
              categories.map((category) => (
                <div key={category} className="examples-menu__category">
                  <div className="examples-menu__category-title">
                    {getCategoryName(category as any)}
                  </div>
                  <div className="examples-menu__items">
                    {groupedExamples[category].map((example) => (
                      <button
                        key={example.id}
                        className="examples-menu__item"
                        onClick={() => handleLoadExample(example)}
                        disabled={loading}
                      >
                        <div className="examples-menu__item-header">
                          <span className="examples-menu__item-title">{example.title}</span>
                          <span
                            className="examples-menu__item-badge"
                            data-difficulty={example.difficulty}
                          >
                            {example.difficulty}
                          </span>
                        </div>
                        <div className="examples-menu__item-description">
                          {example.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
