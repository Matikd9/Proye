export type SanitizeOptions = {
  maxLength: number;
  allowEmpty?: boolean;
  fallback?: string;
};

export function sanitizeText(input: unknown, options: SanitizeOptions): string {
  const { maxLength, allowEmpty = false, fallback = '' } = options;

  if (typeof input !== 'string') {
    return allowEmpty ? fallback : '';
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return allowEmpty ? fallback : '';
  }

  return trimmed.slice(0, maxLength);
}

export function sanitizeOptionalText(input: unknown, options: SanitizeOptions): string | undefined {
  const sanitized = sanitizeText(input, { ...options, allowEmpty: true });
  return sanitized ? sanitized : undefined;
}
