import { describe, it, expect } from 'vitest';
import { db } from './index';

describe('db', () => {
  it('should be truthy', () => {
    expect(db).toBeTruthy();
  });
});

