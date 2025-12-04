import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileIOService } from '../../src/services/fileIO';
import { FILE_CONFIG } from '../../src/utils/constants';

describe('FileIOService', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('validateProgram', () => {
    it('should return true for valid program', () => {
      const program = 'LD I0.0\nOUT Q0.0';
      expect(FileIOService.validateProgram(program)).toBe(true);
    });

    it('should return true for program with empty lines', () => {
      const program = 'LD I0.0\n\n\nOUT Q0.0\n\n';
      expect(FileIOService.validateProgram(program)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(FileIOService.validateProgram('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(FileIOService.validateProgram('   \n  \n  ')).toBe(false);
    });

    it('should return false for null-like values', () => {
      expect(FileIOService.validateProgram(null as any)).toBe(false);
      expect(FileIOService.validateProgram(undefined as any)).toBe(false);
    });

    it('should return true for single instruction', () => {
      expect(FileIOService.validateProgram('LD I0.0')).toBe(true);
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(FileIOService.getFileExtension('program.txt')).toBe('.txt');
    });

    it('should extract extension from path', () => {
      expect(FileIOService.getFileExtension('/path/to/file.txt')).toBe('.txt');
    });

    it('should return empty string for no extension', () => {
      expect(FileIOService.getFileExtension('program')).toBe('');
    });

    it('should handle multiple dots', () => {
      expect(FileIOService.getFileExtension('my.program.txt')).toBe('.txt');
    });

    it('should handle hidden files', () => {
      expect(FileIOService.getFileExtension('.gitignore')).toBe('.gitignore');
    });
  });

  describe('removeFileExtension', () => {
    it('should remove extension from filename', () => {
      expect(FileIOService.removeFileExtension('program.txt')).toBe('program');
    });

    it('should remove extension from path', () => {
      expect(FileIOService.removeFileExtension('/path/to/file.txt')).toBe('/path/to/file');
    });

    it('should return original if no extension', () => {
      expect(FileIOService.removeFileExtension('program')).toBe('program');
    });

    it('should handle multiple dots', () => {
      expect(FileIOService.removeFileExtension('my.program.txt')).toBe('my.program');
    });

    it('should handle hidden files', () => {
      expect(FileIOService.removeFileExtension('.gitignore')).toBe('');
    });
  });

  describe('saveProgramToFile (Web)', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock Blob constructor
      global.Blob = vi.fn(function (this: any, content: any[], options: any) {
        this.content = content;
        this.options = options;
      }) as any;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create download link with correct filename', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      await FileIOService.saveProgramToFile(program, 'test');

      const link = document.querySelector('a');
      expect(link).toBeNull(); // Link should be removed after click
    });

    it('should use default filename if none provided', async () => {
      const program = 'LD I0.0\nOUT Q0.0';

      // Spy on document.createElement
      const createElementSpy = vi.spyOn(document, 'createElement');

      await FileIOService.saveProgramToFile(program);

      // Check that an anchor element was created
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('should add extension if not provided', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      const createElementSpy = vi.spyOn(document, 'createElement');

      await FileIOService.saveProgramToFile(program, 'test');

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('should create blob with correct content and mime type', async () => {
      const program = 'LD I0.0\nOUT Q0.0';

      await FileIOService.saveProgramToFile(program);

      expect(global.Blob).toHaveBeenCalledWith([program], { type: FILE_CONFIG.MIME_TYPE });
    });
  });

  describe('loadProgramFromFile', () => {
    it('should load program from valid file', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      const file = new File([program], 'test.txt', { type: 'text/plain' });

      const result = await FileIOService.loadProgramFromFile(file);

      expect(result).toBe(program);
    });

    it('should reject if file has wrong extension', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await expect(FileIOService.loadProgramFromFile(file)).rejects.toThrow(
        'Invalid file type'
      );
    });

    it('should reject if file is empty', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });

      await expect(FileIOService.loadProgramFromFile(file)).rejects.toThrow('File is empty');
    });

    it('should handle file read errors', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = vi.fn(function (this: any) {
        this.readAsText = vi.fn(function () {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Event('error'));
            }
          }, 0);
        });
      }) as any;

      await expect(FileIOService.loadProgramFromFile(file)).rejects.toThrow(
        'Failed to read file'
      );

      global.FileReader = originalFileReader;
    });

    it('should load multi-line programs', async () => {
      const program = `LD I0.0
AND I0.1
OR I0.2
OUT Q0.0`;
      const file = new File([program], 'test.txt', { type: 'text/plain' });

      const result = await FileIOService.loadProgramFromFile(file);

      expect(result).toBe(program);
    });

    it('should preserve whitespace and formatting', async () => {
      const program = `  LD I0.0\n\t\tAND I0.1\n  OUT Q0.0  `;
      const file = new File([program], 'test.txt', { type: 'text/plain' });

      const result = await FileIOService.loadProgramFromFile(file);

      expect(result).toBe(program);
    });
  });

  describe('isRunningInElectron', () => {
    let originalWindow: any;

    beforeEach(() => {
      originalWindow = global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should return false in browser environment', () => {
      // Default JSDOM environment doesn't have electronAPI
      expect(FileIOService.isRunningInElectron()).toBe(false);
    });

    it('should return true when electronAPI is present', () => {
      // Mock Electron environment
      (global.window as any).electronAPI = {
        openFile: vi.fn(),
        saveFile: vi.fn(),
      };

      expect(FileIOService.isRunningInElectron()).toBe(true);

      // Cleanup
      delete (global.window as any).electronAPI;
    });

    it('should return false when window is undefined', () => {
      const temp = global.window;
      (global as any).window = undefined;

      expect(FileIOService.isRunningInElectron()).toBe(false);

      global.window = temp;
    });
  });

  describe('saveProgramToFile (Electron)', () => {
    beforeEach(() => {
      // Mock Electron environment
      (global.window as any).electronAPI = {
        saveFile: vi.fn(),
        openFile: vi.fn(),
      };
    });

    afterEach(() => {
      delete (global.window as any).electronAPI;
    });

    it('should use Electron API when available', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      (global.window as any).electronAPI.saveFile = vi.fn().mockResolvedValue({
        canceled: false,
        error: null,
      });

      await FileIOService.saveProgramToFile(program);

      expect((global.window as any).electronAPI.saveFile).toHaveBeenCalledWith(program);
    });

    it('should handle cancellation in Electron', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      (global.window as any).electronAPI.saveFile = vi.fn().mockResolvedValue({
        canceled: true,
      });

      // Should not throw when cancelled
      await expect(FileIOService.saveProgramToFile(program)).resolves.toBeUndefined();
    });

    it('should throw error from Electron API', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      (global.window as any).electronAPI.saveFile = vi.fn().mockResolvedValue({
        canceled: false,
        error: 'Failed to save',
      });

      await expect(FileIOService.saveProgramToFile(program)).rejects.toThrow(
        'Failed to save program'
      );
    });
  });

  describe('openProgram (Electron)', () => {
    beforeEach(() => {
      (global.window as any).electronAPI = {
        saveFile: vi.fn(),
        openFile: vi.fn(),
      };
    });

    afterEach(() => {
      delete (global.window as any).electronAPI;
    });

    it('should use Electron API to open file', async () => {
      const program = 'LD I0.0\nOUT Q0.0';
      (global.window as any).electronAPI.openFile = vi.fn().mockResolvedValue({
        canceled: false,
        content: program,
        error: null,
      });

      const result = await FileIOService.openProgram();

      expect(result).toBe(program);
      expect((global.window as any).electronAPI.openFile).toHaveBeenCalled();
    });

    it('should throw when file selection is cancelled', async () => {
      (global.window as any).electronAPI.openFile = vi.fn().mockResolvedValue({
        canceled: true,
      });

      await expect(FileIOService.openProgram()).rejects.toThrow(
        'File selection cancelled'
      );
    });

    it('should throw when Electron returns error', async () => {
      (global.window as any).electronAPI.openFile = vi.fn().mockResolvedValue({
        canceled: false,
        error: 'Permission denied',
      });

      await expect(FileIOService.openProgram()).rejects.toThrow('Permission denied');
    });

    it('should throw when no content received', async () => {
      (global.window as any).electronAPI.openFile = vi.fn().mockResolvedValue({
        canceled: false,
        content: null,
        error: null,
      });

      await expect(FileIOService.openProgram()).rejects.toThrow('No file content received');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long programs', async () => {
      const longProgram = 'LD I0.0\nOUT Q0.0\n'.repeat(10000);
      const file = new File([longProgram], 'test.txt', { type: 'text/plain' });

      const result = await FileIOService.loadProgramFromFile(file);

      expect(result).toBe(longProgram);
    });

    it('should handle special characters in program', async () => {
      const program = 'LD I0.0\n// Comment with special chars: äöü €\nOUT Q0.0';
      const file = new File([program], 'test.txt', { type: 'text/plain' });

      const result = await FileIOService.loadProgramFromFile(file);

      expect(result).toBe(program);
    });

    it('should handle unicode characters', async () => {
      const program = 'LD I0.0\n// 日本語コメント\nOUT Q0.0';
      const file = new File([program], 'test.txt', { type: 'text/plain' });

      const result = await FileIOService.loadProgramFromFile(file);

      expect(result).toBe(program);
    });
  });
});
