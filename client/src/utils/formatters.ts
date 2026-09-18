/**
 * File Size and Data Formatters
 */

/**
 * Formats file size in bytes to an intuitive string.
 * Always indicates the size in MB (as requested by user),
 * and adds KB breakdown for files under 1 MB so small files never show as "0.00 MB".
 *
 * Examples:
 * - 2,500,000 bytes -> "2.38 MB"
 * - 450,000 bytes -> "0.43 MB (439 KB)"
 * - 2,855 bytes -> "< 0.01 MB (2.8 KB)"
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) {
    return "< 0.01 MB (1 KB)";
  }

  const mb = bytes / (1024 * 1024);
  const kb = bytes / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  if (mb >= 0.01) {
    return `${mb.toFixed(2)} MB (${Math.round(kb)} KB)`;
  }

  return `< 0.01 MB (${kb.toFixed(1)} KB)`;
}

/**
 * Pure MB formatter
 */
export function formatOnlyMB(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) {
    return "< 0.01 MB";
  }

  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  if (mb >= 0.01) {
    return `${mb.toFixed(2)} MB`;
  }
  return `< 0.01 MB`;
}
