import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestResultsSummary from './TestResultsSummary.svelte';

describe('TestResultsSummary', () => {
  const mockExecutionResult = {
    passedTests: 7,
    totalTests: 10,
    score: 85,
    maxScore: 100,
    totalExecutionTime: 1250
  };

  describe('overall statistics display', () => {
    it('should display tests passed count', async () => {
      render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const testsPassedLabel = page.getByText('Tests Passed');
      await expect.element(testsPassedLabel).toBeVisible();

      const testsPassedValue = page.getByText('7/10');
      await expect.element(testsPassedValue).toBeVisible();
      await expect.element(testsPassedValue).toHaveClass(/text-2xl/);
      await expect.element(testsPassedValue).toHaveClass(/font-bold/);
    });

    it('should display score', async () => {
      render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const scoreLabel = page.getByText('Score');
      await expect.element(scoreLabel).toBeVisible();

      const scoreValue = page.getByText('85/100');
      await expect.element(scoreValue).toBeVisible();
      await expect.element(scoreValue).toHaveClass(/text-2xl/);
      await expect.element(scoreValue).toHaveClass(/font-bold/);
    });

    it('should display total execution time', async () => {
      render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const timeLabel = page.getByText('Total Time');
      await expect.element(timeLabel).toBeVisible();

      const timeValue = page.getByText('1.25s');
      await expect.element(timeValue).toBeVisible();
      await expect.element(timeValue).toHaveClass(/text-lg/);
      await expect.element(timeValue).toHaveClass(/font-bold/);
    });
  });

  describe('time formatting', () => {
    it('should format time in milliseconds for values < 1000', async () => {
      render(TestResultsSummary, {
        props: {
          executionResult: { ...mockExecutionResult, totalExecutionTime: 750 }
        }
      });

      const timeValue = page.getByText('750ms');
      await expect.element(timeValue).toBeVisible();
    });

    it('should format time in seconds for values >= 1000', async () => {
      render(TestResultsSummary, {
        props: {
          executionResult: { ...mockExecutionResult, totalExecutionTime: 2500 }
        }
      });

      const timeValue = page.getByText('2.50s');
      await expect.element(timeValue).toBeVisible();
    });

    it('should handle edge case of exactly 1000ms', async () => {
      render(TestResultsSummary, {
        props: {
          executionResult: { ...mockExecutionResult, totalExecutionTime: 1000 }
        }
      });

      const timeValue = page.getByText('1.00s');
      await expect.element(timeValue).toBeVisible();
    });
  });

  describe('layout and styling', () => {
    it('should use grid layout with 3 columns', async () => {
      const { container } = render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const gridContainer = container.querySelector('.grid-cols-3');
      expect(gridContainer).toBeTruthy();
      expect(gridContainer?.classList.contains('gap-4')).toBe(true);
    });

    it('should have rounded background styling', async () => {
      const { container } = render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const summaryContainer = container.querySelector('.bg-gray-50');
      expect(summaryContainer).toBeTruthy();
      expect(summaryContainer?.classList.contains('rounded-lg')).toBe(true);
      expect(summaryContainer?.classList.contains('p-4')).toBe(true);
    });

    it('should center-align all statistics', async () => {
      const { container } = render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const centeredElements = container.querySelectorAll('.text-center');
      expect(centeredElements.length).toBe(3); // One for each stat
    });
  });

  describe('accessibility', () => {
    it('should have descriptive labels for screen readers', async () => {
      render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      const labels = ['Tests Passed', 'Score', 'Total Time'];
      for (const label of labels) {
        const labelElement = page.getByText(label);
        await expect.element(labelElement).toBeVisible();
        await expect.element(labelElement).toHaveClass(/text-sm/);
        await expect.element(labelElement).toHaveClass(/text-gray-600/);
      }
    });

    it('should have proper semantic structure', async () => {
      const { container } = render(TestResultsSummary, {
        props: { executionResult: mockExecutionResult }
      });

      // Should have proper label-value pairs
      const labels = container.querySelectorAll('.text-gray-600');
      const values = container.querySelectorAll('.font-bold');
      
      expect(labels.length).toBe(3);
      expect(values.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values correctly', async () => {
      const { container } = render(TestResultsSummary, {
        props: {
          executionResult: {
            passedTests: 0,
            totalTests: 5,
            score: 0,
            maxScore: 50,
            totalExecutionTime: 0
          }
        }
      });

      // Check for zero values using exact text matching
      expect(container.textContent).toContain('0/5');
      expect(container.textContent).toContain('0/50');
      expect(container.textContent).toContain('0ms');
    });

    it('should handle perfect scores', async () => {
      render(TestResultsSummary, {
        props: {
          executionResult: {
            passedTests: 10,
            totalTests: 10,
            score: 100,
            maxScore: 100,
            totalExecutionTime: 500
          }
        }
      });

      await expect.element(page.getByText('10/10')).toBeVisible();
      await expect.element(page.getByText('100/100')).toBeVisible();
    });

    it('should handle large execution times', async () => {
      render(TestResultsSummary, {
        props: {
          executionResult: {
            ...mockExecutionResult,
            totalExecutionTime: 15750
          }
        }
      });

      const timeValue = page.getByText('15.75s');
      await expect.element(timeValue).toBeVisible();
    });
  });
});