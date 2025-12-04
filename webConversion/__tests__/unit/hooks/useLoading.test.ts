/**
 * Tests for useLoading hook
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLoading } from '../../../src/hooks/useLoading';

describe('useLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default loading state (false)', () => {
      const { result } = renderHook(() => useLoading());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBeUndefined();
    });

    it('should initialize with custom loading state', () => {
      const { result } = renderHook(() => useLoading(true));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBeUndefined();
    });
  });

  describe('startLoading', () => {
    it('should set loading state to true', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading message when provided', () => {
      const { result } = renderHook(() => useLoading());
      const message = 'Loading data...';

      act(() => {
        result.current.startLoading(message);
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBe(message);
    });

    it('should not set loading message when not provided', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBeUndefined();
    });
  });

  describe('stopLoading', () => {
    it('should set loading state to false', () => {
      const { result } = renderHook(() => useLoading(true));

      act(() => {
        result.current.stopLoading();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear loading message', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.startLoading('Test message');
      });

      expect(result.current.loadingMessage).toBe('Test message');

      act(() => {
        result.current.stopLoading();
      });

      expect(result.current.loadingMessage).toBeUndefined();
    });
  });

  describe('withLoading', () => {
    it('should provide withLoading function', () => {
      const { result } = renderHook(() => useLoading());

      expect(typeof result.current.withLoading).toBe('function');
    });
  });
});
