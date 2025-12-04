/**
 * Tests for i18n configuration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../../../src/i18n/config';

describe('i18n configuration', () => {
  beforeEach(async () => {
    // Reset to default language
    await i18n.changeLanguage('pt-BR');
  });

  it('should initialize with pt-BR as default language', () => {
    expect(i18n.language).toBe('pt-BR');
  });

  it('should have all required languages', () => {
    const languages = Object.keys(i18n.options.resources || {});

    expect(languages).toContain('pt-BR');
    expect(languages).toContain('en');
    expect(languages).toContain('ja');
    expect(languages).toContain('de');
  });

  it('should have fallback language set to pt-BR', () => {
    expect(i18n.options.fallbackLng).toEqual(['pt-BR']);
  });

  it('should change language to English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  it('should change language to Japanese', async () => {
    await i18n.changeLanguage('ja');
    expect(i18n.language).toBe('ja');
  });

  it('should change language to German', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.language).toBe('de');
  });

  it('should not escape HTML by default (escapeValue: false)', () => {
    expect(i18n.options.interpolation?.escapeValue).toBe(false);
  });

  it('should load translation resources for pt-BR', () => {
    const resources = i18n.options.resources;
    expect(resources?.['pt-BR']).toBeDefined();
    expect(resources?.['pt-BR']?.translation).toBeDefined();
  });

  it('should load translation resources for en', () => {
    const resources = i18n.options.resources;
    expect(resources?.['en']).toBeDefined();
    expect(resources?.['en']?.translation).toBeDefined();
  });

  it('should load translation resources for ja', () => {
    const resources = i18n.options.resources;
    expect(resources?.['ja']).toBeDefined();
    expect(resources?.['ja']?.translation).toBeDefined();
  });

  it('should load translation resources for de', () => {
    const resources = i18n.options.resources;
    expect(resources?.['de']).toBeDefined();
    expect(resources?.['de']?.translation).toBeDefined();
  });
});
