/**
 * Environment variable validation
 * This module validates required environment variables at import time
 */

interface EnvConfig {
  DATABASE_URL: string;
  NODE_ENV: "development" | "production" | "test";
}

function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Please check your .env file or environment configuration.`
    );
  }
  return value || "";
}

function validateDatabaseUrl(url: string): void {
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string " +
        "(starting with postgresql:// or postgres://)"
    );
  }
}

// Cache for validated env
let cachedEnv: EnvConfig | null = null;

export function validateEnv(): EnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }

  const databaseUrl = getEnvVar("DATABASE_URL");
  validateDatabaseUrl(databaseUrl);

  const nodeEnv = (process.env.NODE_ENV ||
    "development") as EnvConfig["NODE_ENV"];
  if (!["development", "production", "test"].includes(nodeEnv)) {
    console.warn(`Unknown NODE_ENV: ${nodeEnv}, defaulting to development`);
  }

  cachedEnv = {
    DATABASE_URL: databaseUrl,
    NODE_ENV: nodeEnv,
  };

  return cachedEnv;
}

// Export validated env object
export const env: EnvConfig = {
  get DATABASE_URL() {
    return validateEnv().DATABASE_URL;
  },
  get NODE_ENV() {
    return validateEnv().NODE_ENV;
  },
};
