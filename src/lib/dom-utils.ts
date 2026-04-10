/**
 * Standardized DOM utilities for Artifexa production environment.
 */

/**
 * Triggers a browser download of a blob content.
 */
export function triggerDownload(content: string, fileName: string, mimeType: string) {
  if (typeof window === "undefined") return;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes a title string for use in filenames.
 */
export function sanitizeFileName(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
