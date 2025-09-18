import crypto from "crypto";

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "default-encryption-key-32-chars-long";
const ALGORITHM = "aes-256-gcm";
// Use 12-byte IV for GCM per NIST recommendations
const IV_LENGTH = 12;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (PHI - Protected Health Information)
 */
export function encryptPHI(data: string): string {
  try {
    // Generate a random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Generate a random salt
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from password and salt
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256");

    // Create cipher with IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    // Set associated data so it's covered by the tag
    cipher.setAAD(salt);

    // Encrypt the data
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get the auth tag
    const tag = cipher.getAuthTag();

    // Combine IV, salt, tag, and encrypted data
    const result =
      iv.toString("hex") +
      ":" +
      salt.toString("hex") +
      ":" +
      tag.toString("hex") +
      ":" +
      encrypted;

    return result;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data (PHI - Protected Health Information)
 */
export function decryptPHI(encryptedData: string): string {
  try {
    // Split the encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const salt = Buffer.from(parts[1], "hex");
    const tag = Buffer.from(parts[2], "hex");
    const encrypted = parts[3];

    // Derive key from password and salt
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256");

    // Create decipher with IV for GCM
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    // Set the same associated data and auth tag
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash data for audit logging (one-way, non-reversible)
 */
export function hashData(data: string): string {
  try {
    // Generate a salt
    const salt = crypto.randomBytes(16).toString("hex");

    // Hash the data with salt
    const hash = crypto
      .pbkdf2Sync(data, salt, 1000, 64, "sha512")
      .toString("hex");

    // Return salt:hash format
    return `${salt}:${hash}`;
  } catch (error) {
    console.error("Hashing failed:", error);
    throw new Error("Failed to hash data");
  }
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hashedData: string): boolean {
  try {
    const [salt, hash] = hashedData.split(":");
    const computedHash = crypto
      .pbkdf2Sync(data, salt, 1000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(computedHash, "hex")
    );
  } catch (error) {
    console.error("Hash verification failed:", error);
    return false;
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString("hex");
  return `${timestamp}_${random}`;
}

/**
 * Mask sensitive data for logging (replaces with asterisks)
 */
export function maskSensitiveData(
  data: string,
  visibleChars: number = 4
): string {
  if (!data || data.length <= visibleChars) {
    return "*".repeat(data.length);
  }

  const visible = data.slice(-visibleChars);
  const masked = "*".repeat(data.length - visibleChars);
  return masked + visible;
}

/**
 * Mask email addresses
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) {
    return email;
  }

  const [localPart, domain] = email.split("@");
  const maskedLocal =
    localPart.length > 2
      ? localPart[0] +
        "*".repeat(localPart.length - 2) +
        localPart[localPart.length - 1]
      : "*".repeat(localPart.length);

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone numbers
 */
export function maskPhone(phone: string): string {
  if (!phone) return phone;

  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return "*".repeat(phone.length);

  const lastFour = cleaned.slice(-4);
  const masked = "*".repeat(cleaned.length - 4);
  return masked + lastFour;
}

/**
 * Mask social security numbers
 */
export function maskSSN(ssn: string): string {
  if (!ssn) return ssn;

  const cleaned = ssn.replace(/\D/g, "");
  if (cleaned.length !== 9) return "*".repeat(ssn.length);

  return `***-**-${cleaned.slice(-4)}`;
}

/**
 * Check if data contains sensitive information
 */
export function containsSensitiveData(data: string): boolean {
  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{3}-\d{3}-\d{4}\b/, // Phone
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/, // Credit card
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // Date
  ];

  return sensitivePatterns.some((pattern) => pattern.test(data));
}

/**
 * Sanitize data for logging (remove or mask sensitive information)
 */
export function sanitizeForLogging(data: string): string {
  if (!data) return data;

  let sanitized = data;

  // Mask SSNs
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****");

  // Mask phone numbers
  sanitized = sanitized.replace(/\b\d{3}-\d{3}-\d{4}\b/g, "***-***-****");

  // Mask emails
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    (email) => maskEmail(email)
  );

  // Mask credit cards
  sanitized = sanitized.replace(
    /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/g,
    "**** **** **** ****"
  );

  return sanitized;
}

/**
 * Generate a secure password hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  try {
    const [salt, hash] = hashedPassword.split(":");
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(computedHash, "hex")
    );
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

/**
 * Generate a secure API key
 */
export function generateAPIKey(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("base64url");
}

/**
 * Encrypt object data
 */
export function encryptObject(obj: any): string {
  return encryptPHI(JSON.stringify(obj));
}

/**
 * Decrypt object data
 */
export function decryptObject(encryptedData: string): any {
  const decrypted = decryptPHI(encryptedData);
  return JSON.parse(decrypted);
}

/**
 * Quick check if a string matches our encrypted payload format iv:salt:tag:cipher (hex segments)
 */
export function isEncryptedString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parts = value.split(":");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^[0-9a-fA-F]+$/.test(p));
}
