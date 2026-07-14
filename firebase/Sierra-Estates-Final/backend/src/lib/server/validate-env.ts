/**
 * validateEnv — checks required and optional environment variables.
 * Call once at application startup (e.g. in next.config.ts or a root layout).
 */

const REQUIRED_VARS = [
  'FIREBASE_PROJECT_ID',
  'GOOGLE_AI_API_KEY',
  'X_SE_SECRET_KEY',
] as const;

const OPTIONAL_VARS = [
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_SERVICE_ACCOUNT_JSON',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'PROPERTY_FINDER_API_BASE',
  'PROPERTY_FINDER_JWT_TOKEN',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'SENDGRID_API_KEY',
  'RESEND_API_KEY',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `[validateEnv] Missing required environment variables:\n  ${missing.join('\n  ')}`
    );
  }

  const missingOptional: string[] = [];
  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) missingOptional.push(key);
  }

  if (missingOptional.length > 0) {
    console.warn(
      `[validateEnv] Optional env vars not set (some features may be disabled):\n  ${missingOptional.join('\n  ')}`
    );
  }
}
