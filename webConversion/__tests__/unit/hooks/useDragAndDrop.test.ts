/**
 * Tests for useDragAndDrop Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../../../src/hooks/useDragAndDrop';

function createDragEvent(type: string, hasFiles = true): DragEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;

  // Mock dataTransfer
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: hasFiles ? ['Files'] : [],
      files: [],
      dropEffect: 'none',
    },
    writable: true,
  });

  return event;
}

function createDropEvent(files: File[]): DragEvent {
  const event = createDragEvent('drop', true);

  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: ['Files'],
      files,
      dropEffect: 'none',
    },
    writable: true,
  });

  return event;
}

describe('useDragAndDrop', () => {
  const mockOnFileDrop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should return isDragging as false initially', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      expect(result.current.isDragging).toBe(false);
    });

    it('should accept options', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt', '.il'],
          enabled: true,
        })
      );

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('Drag Enter', () => {
    it('should set isDragging to true on dragenter with files', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      const event = createDragEvent('dragenter', true);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('should not set isDragging for dragenter without files', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      const event = createDragEvent('dragenter', false);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('should handle multiple dragenter events', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      const event1 = createDragEvent('dragenter', true);
      const event2 = createDragEvent('dragenter', true);

      act(() => {
        document.dispatchEvent(event1);
        document.dispatchEvent(event2);
      });

      expect(result.current.isDragging).toBe(true);
    });
  });

  describe('Drag Leave', () => {
    it('should set isDragging to false when drag counter reaches 0', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      const enterEvent = createDragEvent('dragenter', true);
      const leaveEvent = createDragEvent('dragleave', true);

      act(() => {
        document.dispatchEvent(enterEvent);
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        document.dispatchEvent(leaveEvent);
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('should maintain isDragging when counter is still positive', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      const enterEvent = createDragEvent('dragenter', true);
      const leaveEvent = createDragEvent('dragleave', true);

      act(() => {
        document.dispatchEvent(enterEvent);
        document.dispatchEvent(enterEvent); // Counter = 2
        document.dispatchEvent(leaveEvent); // Counter = 1
      });

      expect(result.current.isDragging).toBe(true);
    });
  });

  describe('Drag Over', () => {
    it('should prevent default on dragover', () => {
      renderHook(() => useDragAndDrop({ onFileDrop: mockOnFileDrop }));

      const event = createDragEvent('dragover', true);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should set dropEffect to copy', () => {
      renderHook(() => useDragAndDrop({ onFileDrop: mockOnFileDrop }));

      const event = createDragEvent('dragover', true);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(event.dataTransfer?.dropEffect).toBe('copy');
    });
  });

  describe('Drop', () => {
    it('should call onFileDrop when valid file is dropped', () => {
      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt'],
        })
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith(file);
    });

    it('should not call onFileDrop for invalid file extension', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt'],
        })
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('File type not accepted')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should reset isDragging to false after drop', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt'],
        })
      );

      // First drag enter
      const enterEvent = createDragEvent('dragenter', true);
      act(() => {
        document.dispatchEvent(enterEvent);
      });

      expect(result.current.isDragging).toBe(true);

      // Drop file
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const dropEvent = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(dropEvent);
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('should handle drop without files', () => {
      renderHook(() => useDragAndDrop({ onFileDrop: mockOnFileDrop }));

      const event = createDropEvent([]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).not.toHaveBeenCalled();
    });

    it('should only handle first file when multiple files are dropped', () => {
      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt'],
        })
      );

      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      const event = createDropEvent([file1, file2]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).toHaveBeenCalledTimes(1);
      expect(mockOnFileDrop).toHaveBeenCalledWith(file1);
    });
  });

  describe('Accepted Extensions', () => {
    it('should accept file with matching extension', () => {
      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt', '.il'],
        })
      );

      const file = new File(['content'], 'program.il', { type: 'text/plain' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith(file);
    });

    it('should be case insensitive for extensions', () => {
      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: ['.txt'],
        })
      );

      const file = new File(['content'], 'test.TXT', { type: 'text/plain' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith(file);
    });

    it('should accept any file when acceptedExtensions is empty', () => {
      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          acceptedExtensions: [],
        })
      );

      const file = new File(['content'], 'any.xyz', { type: 'application/octet-stream' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith(file);
    });

    it('should default to .txt extension', () => {
      renderHook(() => useDragAndDrop({ onFileDrop: mockOnFileDrop }));

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).toHaveBeenCalledWith(file);
    });
  });

  describe('Enabled Option', () => {
    it('should not handle drag events when disabled', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          enabled: false,
        })
      );

      const event = createDragEvent('dragenter', true);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('should not call onFileDrop when disabled', () => {
      renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          enabled: false,
        })
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = createDropEvent([file]);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(mockOnFileDrop).not.toHaveBeenCalled();
    });

    it('should enable drag events when enabled is true', () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          onFileDrop: mockOnFileDrop,
          enabled: true,
        })
      );

      const event = createDragEvent('dragenter', true);

      act(() => {
        document.dispatchEvent(event);
      });

      expect(result.current.isDragging).toBe(true);
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useDragAndDrop({ onFileDrop: mockOnFileDrop })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragleave', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('dragenter', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('dragleave', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function));
    });
  });

  describe('Event Prevention', () => {
    it('should prevent default and stop propagation on dragenter', () => {
      renderHook(() => useDragAndDrop({ onFileDrop: mockOnFileDrop }));

      const event = createDragEvent('dragenter', true);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should prevent default and stop propagation on drop', () => {
      renderHook(() => useDragAndDrop({ onFileDrop: mockOnFileDrop }));

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = createDropEvent([file]);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });
});
