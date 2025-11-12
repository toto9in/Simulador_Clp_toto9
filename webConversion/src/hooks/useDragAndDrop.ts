/**
 * Drag and Drop Hook
 * Handles file drag and drop functionality
 */

import { useEffect, useState, useCallback } from 'react';

export interface DragAndDropOptions {
  onFileDrop: (file: File) => void;
  acceptedExtensions?: string[];
  enabled?: boolean;
}

export function useDragAndDrop({
  onFileDrop,
  acceptedExtensions = ['.txt'],
  enabled = true
}: DragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCounter] = useState(0);

  const isValidFile = useCallback((file: File): boolean => {
    if (acceptedExtensions.length === 0) return true;

    const fileName = file.name.toLowerCase();
    return acceptedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
  }, [acceptedExtensions]);

  useEffect(() => {
    if (!enabled) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setDragCounter(prev => prev + 1);
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setDragCounter(prev => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragging(false);
        }
        return newCounter;
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);
      setDragCounter(0);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0]; // Only handle first file

      if (isValidFile(file)) {
        onFileDrop(file);
      } else {
        console.warn(`File type not accepted: ${file.name}`);
        console.warn(`Accepted extensions: ${acceptedExtensions.join(', ')}`);
      }
    };

    // Add event listeners
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [enabled, onFileDrop, isValidFile, acceptedExtensions]);

  return { isDragging };
}
