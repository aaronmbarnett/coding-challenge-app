import { describe, it, expect } from 'vitest';
import { parseFormDataToChallenge } from './challenges';
import { parseSessionFormData } from './sessions';

// Semantic time constants for form validation tests
const THIRTY_MINUTES_SECONDS = 30 * 60; // 1800
const ONE_HOUR_SECONDS = 60 * 60; // 3600
const TWO_HOURS_SECONDS = 2 * 60 * 60; // 7200

describe('Form validation and parsing', () => {
  describe('parseFormDataToChallenge', () => {
    it('should parse complete form data correctly', () => {
      const formData = new FormData();
      formData.set('title', 'Array Sum Challenge');
      formData.set('description', '# Calculate the sum of an array\n\nImplement a function that calculates the sum.');
      formData.set('languages', 'javascript,python,go');
      formData.set('starterCode', 'function sum(arr) {\n  // Your code here\n}');
      formData.set('timeLimit', THIRTY_MINUTES_SECONDS.toString());

      const result = parseFormDataToChallenge(formData);

      expect(result).toEqual({
        title: 'Array Sum Challenge',
        description: '# Calculate the sum of an array\n\nImplement a function that calculates the sum.',
        languages: 'javascript,python,go',
        starterCode: 'function sum(arr) {\n  // Your code here\n}',
        timeLimitSec: THIRTY_MINUTES_SECONDS
      });
    });

    it('should handle empty optional fields', () => {
      const formData = new FormData();
      formData.set('title', 'Basic Challenge');
      formData.set('description', '# Simple test');
      formData.set('languages', 'javascript');
      formData.set('starterCode', '');
      formData.set('timeLimit', '');

      const result = parseFormDataToChallenge(formData);

      expect(result).toEqual({
        title: 'Basic Challenge',
        description: '# Simple test',
        languages: 'javascript',
        starterCode: '',
        timeLimitSec: null
      });
    });

    it('should handle null values from form data', () => {
      const formData = new FormData();
      formData.set('title', 'Test Challenge');
      formData.set('description', '# Test');
      formData.set('languages', 'javascript');
      // starterCode and timeLimit not set (will be null)

      const result = parseFormDataToChallenge(formData);

      expect(result).toEqual({
        title: 'Test Challenge',
        description: '# Test',
        languages: 'javascript',
        starterCode: null,
        timeLimitSec: null
      });
    });

    it('should parse numeric time limit correctly', () => {
      const formData = new FormData();
      formData.set('title', 'Timed Challenge');
      formData.set('description', '# Solve quickly');
      formData.set('languages', 'python');
      formData.set('timeLimit', ONE_HOUR_SECONDS.toString());

      const result = parseFormDataToChallenge(formData);

      expect(result.timeLimitSec).toBe(ONE_HOUR_SECONDS);
    });

    it('should handle zero time limit', () => {
      const formData = new FormData();
      formData.set('title', 'No Time Limit');
      formData.set('description', '# Take your time');
      formData.set('languages', 'java');
      formData.set('timeLimit', '0');

      const result = parseFormDataToChallenge(formData);

      expect(result.timeLimitSec).toBe(0);
    });

    it('should handle multiple languages correctly', () => {
      const formData = new FormData();
      formData.set('title', 'Multi-Language Challenge');
      formData.set('description', '# Support multiple languages');
      formData.set('languages', 'javascript,python,go,rust,typescript,java,cpp');

      const result = parseFormDataToChallenge(formData);

      expect(result.languages).toBe('javascript,python,go,rust,typescript,java,cpp');
    });

    it('should preserve whitespace in description and starter code', () => {
      const formData = new FormData();
      formData.set('title', 'Whitespace Test');
      formData.set('description', '# Test\n\n  Indented content\n    More indentation');
      formData.set('languages', 'javascript');
      formData.set('starterCode', 'function test() {\n    // Indented comment\n    return null;\n}');

      const result = parseFormDataToChallenge(formData);

      expect(result.description).toBe('# Test\n\n  Indented content\n    More indentation');
      expect(result.starterCode).toBe('function test() {\n    // Indented comment\n    return null;\n}');
    });
  });

  describe('parseSessionFormData', () => {
    it('should parse session form data with multiple challenges', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-123');
      formData.set('totalDurationSec', TWO_HOURS_SECONDS.toString());
      formData.append('challengeIds', 'challenge-1');
      formData.append('challengeIds', 'challenge-2');
      formData.append('challengeIds', 'challenge-3');

      const result = parseSessionFormData(formData);

      expect(result).toEqual({
        candidateId: 'candidate-123',
        totalDurationSec: TWO_HOURS_SECONDS,
        challengeIds: ['challenge-1', 'challenge-2', 'challenge-3']
      });
    });

    it('should parse session form data with single challenge', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-456');
      formData.set('totalDurationSec', ONE_HOUR_SECONDS.toString());
      formData.append('challengeIds', 'challenge-abc');

      const result = parseSessionFormData(formData);

      expect(result).toEqual({
        candidateId: 'candidate-456',
        totalDurationSec: ONE_HOUR_SECONDS,
        challengeIds: ['challenge-abc']
      });
    });

    it('should handle form with no challenges selected', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-789');
      formData.set('totalDurationSec', THIRTY_MINUTES_SECONDS.toString());
      // No challengeIds appended

      const result = parseSessionFormData(formData);

      expect(result).toEqual({
        candidateId: 'candidate-789',
        totalDurationSec: THIRTY_MINUTES_SECONDS,
        challengeIds: []
      });
    });

    it('should handle form with candidate but unrelated fields', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-999');
      formData.set('totalDurationSec', '5400');
      formData.set('otherField', 'should be ignored');
      formData.append('challengeIds', 'challenge-test');
      formData.set('randomInput', 'also ignored');

      const result = parseSessionFormData(formData);

      expect(result).toEqual({
        candidateId: 'candidate-999',
        totalDurationSec: 5400,
        challengeIds: ['challenge-test']
      });
    });

    it('should preserve challenge ID order from form', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-order');
      formData.set('totalDurationSec', '4800');
      // FormData maintains insertion order
      formData.append('challengeIds', 'challenge-z');
      formData.append('challengeIds', 'challenge-a');
      formData.append('challengeIds', 'challenge-m');

      const result = parseSessionFormData(formData);

      expect(result.challengeIds).toEqual(['challenge-z', 'challenge-a', 'challenge-m']);
    });

    it('should handle numeric parsing for totalDurationSec', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-numeric');
      formData.set('totalDurationSec', '10800'); // 3 hours
      formData.append('challengeIds', 'challenge-long');

      const result = parseSessionFormData(formData);

      expect(result.totalDurationSec).toBe(10800);
      expect(typeof result.totalDurationSec).toBe('number');
    });

    it('should handle invalid totalDurationSec gracefully', () => {
      const formData = new FormData();
      formData.set('candidateId', 'candidate-invalid');
      formData.set('totalDurationSec', 'not-a-number');
      formData.append('challengeIds', 'challenge-test');

      const result = parseSessionFormData(formData);

      expect(result.totalDurationSec).toBeNaN();
    });
  });

  describe('Edge cases and malformed data', () => {
    it('should handle empty FormData gracefully', () => {
      const formData = new FormData();

      expect(() => parseFormDataToChallenge(formData)).not.toThrow();
      expect(() => parseSessionFormData(formData)).not.toThrow();

      const challengeResult = parseFormDataToChallenge(formData);
      const sessionResult = parseSessionFormData(formData);

      expect(challengeResult).toEqual({
        title: null,
        description: null,
        languages: null,
        starterCode: null,
        timeLimitSec: null
      });

      expect(sessionResult).toEqual({
        candidateId: null,
        totalDurationSec: NaN,
        challengeIds: []
      });
    });

    it('should handle special characters in form data', () => {
      const formData = new FormData();
      formData.set('title', 'Challenge with "quotes" & <tags>');
      formData.set('description', '# Special chars: àáâã ñ üö €£¥');
      formData.set('languages', 'javascript');
      formData.set('starterCode', 'const msg = "Hello \\n\\t World!";');

      const result = parseFormDataToChallenge(formData);

      expect(result.title).toBe('Challenge with "quotes" & <tags>');
      expect(result.description).toBe('# Special chars: àáâã ñ üö €£¥');
      expect(result.starterCode).toBe('const msg = "Hello \\n\\t World!";');
    });
  });
});