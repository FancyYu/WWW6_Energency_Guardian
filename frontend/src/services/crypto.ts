/**
 * Crypto Utils - 加密工具函数
 *
 * 提供底层加密操作、随机数生成、密钥派生等工具函数
 * 支持Web Crypto API和Node.js crypto模块
 */

// 检测运行环境
const isNode = typeof window === "undefined" && typeof global !== "undefined";
const isBrowser = typeof window !== "undefined";

// 动态导入Node.js crypto模块（如果在Node.js环境中）
let nodeCrypto: any = null;
if (isNode) {
  try {
    nodeCrypto = require("crypto");
  } catch (error) {
    console.warn("Node.js crypto module not available");
  }
}

/**
 * 加密工具类
 */
export class CryptoUtils {
  /**
   * 生成安全随机字节
   * @param length 字节长度
   * @returns 随机字节数组
   */
  generateRandomBytes(length: number): Uint8Array {
    if (isBrowser && crypto && crypto.getRandomValues) {
      // 浏览器环境使用Web Crypto API
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return bytes;
    } else if (isNode && nodeCrypto) {
      // Node.js环境使用crypto模块
      return new Uint8Array(nodeCrypto.randomBytes(length));
    } else {
      // 降级到Math.random（不推荐用于生产环境）
      console.warn(
        "Using Math.random for random bytes generation - not cryptographically secure!"
      );
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    }
  }

  /**
   * 生成AES-256-GCM密钥
   * @returns 加密密钥
   */
  async generateKey(): Promise<CryptoKey> {
    if (isBrowser && crypto && crypto.subtle) {
      return await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );
    } else if (isNode && nodeCrypto) {
      // Node.js环境的实现
      const keyBytes = nodeCrypto.randomBytes(32); // 256 bits
      return await this.importKey(keyBytes);
    } else {
      throw new Error("Crypto API not available");
    }
  }

  /**
   * 从密码派生密钥
   * @param password 密码
   * @param salt 盐值
   * @param iterations 迭代次数
   * @returns 派生的密钥
   */
  async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey> {
    if (isBrowser && crypto && crypto.subtle) {
      // 浏览器环境使用Web Crypto API
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);

      // 导入密码作为密钥材料
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordBytes,
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      // 派生AES密钥
      return await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new Uint8Array(salt),
          iterations: iterations,
          hash: "SHA-256",
        },
        keyMaterial,
        {
          name: "AES-GCM",
          length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );
    } else if (isNode && nodeCrypto) {
      // Node.js环境使用crypto模块
      const derivedKey = nodeCrypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        32,
        "sha256"
      );
      return await this.importKey(derivedKey);
    } else {
      throw new Error("Crypto API not available");
    }
  }

  /**
   * 导入原始密钥字节为CryptoKey
   * @param keyBytes 密钥字节
   * @returns CryptoKey对象
   */
  async importKey(keyBytes: Uint8Array | Buffer): Promise<CryptoKey> {
    if (isBrowser && crypto && crypto.subtle) {
      return await crypto.subtle.importKey(
        "raw",
        new Uint8Array(keyBytes),
        {
          name: "AES-GCM",
          length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );
    } else {
      // Node.js环境的模拟实现
      // 注意：这是一个简化的实现，实际应用中可能需要更复杂的处理
      return {
        algorithm: { name: "AES-GCM", length: 256 },
        extractable: true,
        type: "secret" as KeyType,
        usages: ["encrypt", "decrypt"] as KeyUsage[],
        // 存储原始密钥字节（仅用于演示）
        _keyBytes: new Uint8Array(keyBytes),
      } as CryptoKey & { _keyBytes: Uint8Array };
    }
  }

  /**
   * 导出密钥为原始字节
   * @param key CryptoKey对象
   * @returns 密钥字节
   */
  async exportKey(key: CryptoKey): Promise<Uint8Array> {
    if (isBrowser && crypto && crypto.subtle) {
      const exported = await crypto.subtle.exportKey("raw", key);
      return new Uint8Array(exported);
    } else {
      // Node.js环境的处理
      const keyWithBytes = key as CryptoKey & { _keyBytes?: Uint8Array };
      if (keyWithBytes._keyBytes) {
        return keyWithBytes._keyBytes;
      } else {
        throw new Error("Cannot export key in Node.js environment");
      }
    }
  }

  /**
   * 计算SHA-256哈希
   * @param data 要哈希的数据
   * @returns 哈希值
   */
  async sha256(data: string | Uint8Array): Promise<Uint8Array> {
    const bytes =
      typeof data === "string" ? new TextEncoder().encode(data) : data;

    if (isBrowser && crypto && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new Uint8Array(bytes)
      );
      return new Uint8Array(hashBuffer);
    } else if (isNode && nodeCrypto) {
      const hash = nodeCrypto.createHash("sha256");
      hash.update(bytes);
      return new Uint8Array(hash.digest());
    } else {
      throw new Error("Crypto API not available");
    }
  }

  /**
   * 计算HMAC-SHA256
   * @param key 密钥
   * @param data 要签名的数据
   * @returns HMAC值
   */
  async hmacSha256(
    key: Uint8Array,
    data: string | Uint8Array
  ): Promise<Uint8Array> {
    const dataBytes =
      typeof data === "string" ? new TextEncoder().encode(data) : data;

    if (isBrowser && crypto && crypto.subtle) {
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new Uint8Array(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        new Uint8Array(dataBytes)
      );
      return new Uint8Array(signature);
    } else if (isNode && nodeCrypto) {
      const hmac = nodeCrypto.createHmac("sha256", key);
      hmac.update(dataBytes);
      return new Uint8Array(hmac.digest());
    } else {
      throw new Error("Crypto API not available");
    }
  }

  /**
   * 生成密码学安全的随机字符串
   * @param length 字符串长度
   * @param charset 字符集
   * @returns 随机字符串
   */
  generateRandomString(
    length: number,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ): string {
    const bytes = this.generateRandomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    return result;
  }

  /**
   * 生成UUID v4
   * @returns UUID字符串
   */
  generateUUID(): string {
    if (isBrowser && crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    } else {
      // 手动生成UUID v4
      const bytes = this.generateRandomBytes(16);

      // 设置版本号 (4) 和变体位
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // 版本4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // 变体10

      // 格式化为UUID字符串
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
      ].join("-");
    }
  }

  /**
   * ArrayBuffer转Base64
   * @param buffer ArrayBuffer
   * @returns Base64字符串
   */
  arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes =
      buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

    if (isBrowser && btoa) {
      // 浏览器环境
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } else if (isNode) {
      // Node.js环境
      return Buffer.from(bytes).toString("base64");
    } else {
      // 手动实现Base64编码
      return this.manualBase64Encode(bytes);
    }
  }

  /**
   * Base64转ArrayBuffer
   * @param base64 Base64字符串
   * @returns ArrayBuffer
   */
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    if (isBrowser && atob) {
      // 浏览器环境
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const buffer = new ArrayBuffer(bytes.length);
      const view = new Uint8Array(buffer);
      view.set(bytes);
      return buffer;
    } else if (isNode) {
      // Node.js环境
      const buffer = Buffer.from(base64, "base64");
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    } else {
      // 手动实现Base64解码
      const bytes = this.manualBase64Decode(base64);
      const buffer = new ArrayBuffer(bytes.length);
      const view = new Uint8Array(buffer);
      view.set(bytes);
      return buffer;
    }
  }

  /**
   * 手动Base64编码（降级实现）
   * @param bytes 字节数组
   * @returns Base64字符串
   */
  private manualBase64Encode(bytes: Uint8Array): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i = 0;

    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : "=";
      result += i - 1 < bytes.length ? chars.charAt(bitmap & 63) : "=";
    }

    return result;
  }

  /**
   * 手动Base64解码（降级实现）
   * @param base64 Base64字符串
   * @returns 字节数组
   */
  private manualBase64Decode(base64: string): Uint8Array {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = new Uint8Array(256);

    // 构建查找表
    for (let i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    const len = base64.length;
    let bufferLength = len * 0.75;

    // 处理填充字符
    if (base64[len - 1] === "=") {
      bufferLength--;
      if (base64[len - 2] === "=") {
        bufferLength--;
      }
    }

    const bytes = new Uint8Array(bufferLength);
    let p = 0;

    for (let i = 0; i < len; i += 4) {
      const encoded1 = lookup[base64.charCodeAt(i)];
      const encoded2 = lookup[base64.charCodeAt(i + 1)];
      const encoded3 = lookup[base64.charCodeAt(i + 2)];
      const encoded4 = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      if (p < bufferLength) {
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      }
      if (p < bufferLength) {
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }
    }

    return bytes;
  }

  /**
   * 安全比较两个字节数组（防止时序攻击）
   * @param a 字节数组A
   * @param b 字节数组B
   * @returns 是否相等
   */
  constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }

    return result === 0;
  }

  /**
   * 清除敏感数据（将内存置零）
   * @param data 要清除的数据
   */
  clearSensitiveData(data: Uint8Array | ArrayBuffer): void {
    const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = 0;
    }
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 强度评分和建议
   */
  validatePasswordStrength(password: string): {
    score: number;
    strength: "weak" | "medium" | "strong" | "very-strong";
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // 长度检查
    if (password.length >= 8) score += 1;
    else suggestions.push("密码长度至少8个字符");

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) suggestions.push("建议使用12个或更多字符");

    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push("包含小写字母");

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push("包含大写字母");

    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push("包含数字");

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else suggestions.push("包含特殊字符");

    // 复杂性检查
    if (password.length >= 16) score += 1;
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/.test(password))
      score += 1;

    // 常见模式检查
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /(.)\1{2,}/, // 重复字符
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        score -= 1;
        suggestions.push("避免使用常见模式或重复字符");
        break;
      }
    }

    // 确定强度等级
    let strength: "weak" | "medium" | "strong" | "very-strong";
    if (score <= 2) strength = "weak";
    else if (score <= 4) strength = "medium";
    else if (score <= 6) strength = "strong";
    else strength = "very-strong";

    return {
      score: Math.max(0, Math.min(8, score)),
      strength,
      suggestions,
    };
  }
}
