/**
 * Test Setup - 测试环境配置
 */

import { vi } from "vitest";

// Mock Web Crypto API for testing environment
if (typeof crypto === "undefined") {
  const { webcrypto } = await import("crypto");
  global.crypto = webcrypto as Crypto;
}

// Mock localStorage
if (typeof localStorage === "undefined") {
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  } as any;
}

// Mock console methods for cleaner test output
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};
