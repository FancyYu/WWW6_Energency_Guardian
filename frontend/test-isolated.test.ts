import { describe, it, expect } from 'vitest';

describe('Isolated Test Suite', () => {
  it('should work without any imports', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('tests vitest configuration directly', () => {
    console.log('✅ Isolated test is running');
    expect(true).toBe(true);
  });
});
