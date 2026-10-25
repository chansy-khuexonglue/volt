import { createHmac, timingSafeEqual } from 'node:crypto';

export function signCookie(value: string, secret: string): string {
  const hmac = createHmac('sha256', secret).update(value).digest('base64url');
  return `s:${value}.${hmac}`;
}

export function unsignCookie(signedValue: string, secret: string): string | false {
  if (!signedValue.startsWith('s:')) {
    return false;
  }

  const dotIndex = signedValue.lastIndexOf('.');
  if (dotIndex === -1) {
    return false;
  }

  const rawValue = signedValue.slice(2, dotIndex);
  const signature = signedValue.slice(dotIndex + 1);

  const expectedSignature = createHmac('sha256', secret).update(rawValue).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length) {
    return false;
  }

  if (!timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  return rawValue;
}
