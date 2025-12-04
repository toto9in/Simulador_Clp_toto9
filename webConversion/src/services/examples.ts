/**
 * Examples Service
 * Loads example programs from the public/examples directory
 */

import { getExamplePath, getAssetPath } from '../utils/assets';

export interface Example {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'logic' | 'control' | 'timers' | 'counters' | 'sequences' | 'traffic-lights' | 'instructions';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  file: string;
}

export interface ExamplesIndex {
  examples: Example[];
}

/**
 * Fetch the examples index
 */
export async function fetchExamplesIndex(): Promise<ExamplesIndex> {
  try {
    const response = await fetch(getAssetPath('examples/index.json'));
    if (!response.ok) {
      throw new Error('Failed to fetch examples index');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching examples index:', error);
    throw error;
  }
}

/**
 * Load an example program by its file name
 */
export async function loadExample(fileName: string): Promise<string> {
  try {
    const response = await fetch(getExamplePath(fileName));
    if (!response.ok) {
      throw new Error(`Failed to load example: ${fileName}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading example:', error);
    throw error;
  }
}

/**
 * Get examples grouped by category
 */
export function groupExamplesByCategory(examples: Example[]): Record<string, Example[]> {
  return examples.reduce((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = [];
    }
    acc[example.category].push(example);
    return acc;
  }, {} as Record<string, Example[]>);
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty: Example['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return '#4caf50'; // Green
    case 'intermediate':
      return '#ff9800'; // Orange
    case 'advanced':
      return '#f44336'; // Red
    default:
      return '#666666';
  }
}

/**
 * Get category display name
 */
export function getCategoryName(category: Example['category']): string {
  switch (category) {
    case 'basics':
      return 'Basics';
    case 'logic':
      return 'Logic Gates';
    case 'control':
      return 'Control';
    case 'timers':
      return 'Timers';
    case 'counters':
      return 'Counters';
    case 'sequences':
      return 'Sequences';
    case 'traffic-lights':
      return 'Traffic Lights';
    case 'instructions':
      return 'Instructions Reference';
    default:
      return category;
  }
}
