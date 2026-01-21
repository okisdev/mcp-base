'use client';

export interface ServiceConfig {
  [key: string]: string;
}

const STORAGE_KEY = 'mcp-base-config';

/**
 * Get stored configuration for all services
 */
export function getAllConfigs(): Record<string, ServiceConfig> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Get configuration for a specific service
 */
export function getConfig(service: string): ServiceConfig {
  const configs = getAllConfigs();
  return configs[service] || {};
}

/**
 * Set configuration for a specific service
 */
export function setConfig(service: string, config: ServiceConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  const configs = getAllConfigs();
  configs[service] = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Clear configuration for a specific service
 */
export function clearConfig(service: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const configs = getAllConfigs();
  delete configs[service];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Check if a service is configured (has all required fields)
 */
export function isConfigured(
  service: string,
  requiredFields: string[]
): boolean {
  const config = getConfig(service);
  return requiredFields.every(
    (field) => config[field] && config[field].trim() !== ''
  );
}
