/**
 * Encryption Service Tests - 基础测试
 */

import { describe, test, expect, beforeEach } from "vitest";
import { EncryptionService } from "../encryption";
import { CryptoUtils } from "../crypto";

describe("EncryptionService", () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  test("should create encryption service", () => {
    expect(encryptionService).toBeDefined();
  });

  test("should generate key", async () => {
    const keyInfo = await encryptionService.generateKey("test-key");

    expect(keyInfo).toBeDefined();
    expect(keyInfo.id).toBe("test-key");
    expect(keyInfo.algorithm).toBe("AES-GCM");
  });
});

describe("CryptoUtils", () => {
  let cryptoUtils: CryptoUtils;

  beforeEach(() => {
    cryptoUtils = new CryptoUtils();
  });

  test("should generate random bytes", () => {
    const bytes = cryptoUtils.generateRandomBytes(32);

    expect(bytes).toBeDefined();
    expect(bytes.length).toBe(32);
  });

  test("should generate random string", () => {
    const str = cryptoUtils.generateRandomString(16);

    expect(str).toBeDefined();
    expect(str.length).toBe(16);
  });

  test("should generate UUID", () => {
    const uuid = cryptoUtils.generateUUID();

    expect(uuid).toBeDefined();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test("should validate password strength", () => {
    const weak = cryptoUtils.validatePasswordStrength("123");
    const strong = cryptoUtils.validatePasswordStrength(
      "MyStr0ng!P@ssw0rd2024"
    );

    expect(weak.strength).toBe("weak");
    expect(strong.strength).toBe("very-strong");
  });

  test("should encode and decode base64", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const base64 = cryptoUtils.arrayBufferToBase64(data);
    const decoded = new Uint8Array(cryptoUtils.base64ToArrayBuffer(base64));

    expect(decoded).toEqual(data);
  });
});
