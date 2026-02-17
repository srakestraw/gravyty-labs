/**
 * Central redaction for security/privacy. Never store raw PII in logs; use hashes + last4 where useful.
 * ApprovalRequest payload previews must be redacted. Message bodies only in MessageArtifacts with retention.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /\+?[\d\s\-()]{10,}/g;

/** Hash a string (simple non-crypto hash for redaction labels). For audit use a proper hash. */
function hashLabel(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `h:${Math.abs(h).toString(36)}`;
}

/** Redact email: replace with hash + last 2 chars of local part. */
export function redactEmail(email: string): string {
  if (!email || email.length < 3) return "[redacted]";
  const at = email.indexOf("@");
  if (at === -1) return hashLabel(email);
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const last2 = local.slice(-2);
  return `${hashLabel(local)}..${last2}@${hashLabel(domain)}`;
}

/** Redact phone: keep last 4 digits only. */
export function redactPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "[redacted]";
  return `***-***-${digits.slice(-4)}`;
}

/** Redact all emails in text. */
export function redactEmailsInText(text: string): string {
  return text.replace(EMAIL_REGEX, (m) => redactEmail(m));
}

/** Redact all phone-like sequences in text. */
export function redactPhonesInText(text: string): string {
  return text.replace(PHONE_REGEX, (m) => redactPhone(m));
}

/** Redact PII in a string (emails + phones). Use for logs and payload previews. */
export function redactPii(text: string): string {
  return redactPhonesInText(redactEmailsInText(text));
}

/** Redact payload for ApprovalRequest.payloadPreview. Never store raw body/email/phone. */
export function redactPayloadPreview(payload: unknown): string {
  if (payload === null || payload === undefined) return "[redacted]";
  if (typeof payload === "string") return redactPii(payload);
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === "body" || k === "email" || k === "phone" || k === "subject") {
        safe[k] = "[redacted]";
      } else if (typeof v === "string") {
        safe[k] = redactPii(v);
      } else {
        safe[k] = v;
      }
    }
    return JSON.stringify(safe);
  }
  return String(payload);
}
