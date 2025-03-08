import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SpiderChart from './SpiderChart.svelte';
import { normalizeData, mergeConfig } from './utils';

describe('SpiderChart', () => {
  // Test rendering
  it('renders without errors', () => {
    const { container } = render(SpiderChart, {
      props: {
        data: [
          { axis: 'A', value: 10 },
          { axis: 'B', value: 20 },
          { axis: 'C', value: 30 }
        ]
      }
    });
    
    expect(container.querySelector('.spider-chart-container')).not.toBeNull();
    expect(container.querySelector('.spider-chart')).not.toBeNull();
  });
  
  // Test with title
  it('renders with title', () => {
    const { container } = render(SpiderChart, {
      props: {
        data: [{ axis: 'A', value: 10 }],
        title: 'Test Chart'
      }
    });
    
    const titleElement = container.querySelector('.spider-chart-title');
    expect(titleElement).not.toBeNull();
    expect(titleElement?.textContent).toBe('Test Chart');
  });
});

describe('Utils', () => {
  // Test normalizeData
  it('normalizes simple data array', () => {
    const data = [
      { axis: 'A', value: 10 },
      { axis: 'B', value: 20 }
    ];
    
    const normalized = normalizeData(data);
    
    expect(normalized).toHaveLength(1);
    expect(normalized[0].name).toBe('Default');
    expect(normalized[0].data).toEqual(data);
  });
  
  it('keeps series data as is', () => {
    const data = [
      {
        name: 'Series 1',
        data: [
          { axis: 'A', value: 10 },
          { axis: 'B', value: 20 }
        ]
      }
    ];
    
    const normalized = normalizeData(data);
    
    expect(normalized).toEqual(data);
  });
  
  // Test mergeConfig
  it('merges config with defaults', () => {
    const config = {
      min: 10,
      max: 90,
      color: '#ff0000'
    };
    
    const merged = mergeConfig(config);
    
    expect(merged.min).toBe(10);
    expect(merged.max).toBe(90);
    expect(merged.color).toBe('#ff0000');
    expect(merged.levels).toBe(5); // Default value
    expect(merged.opacity).toBe(0.5); // Default value
  });
  
  it('returns default config when no config provided', () => {
    const merged = mergeConfig();
    
    expect(merged.min).toBe(0);
    expect(merged.max).toBe(100);
    expect(merged.color).toBe('#2196F3');
  });
}); 