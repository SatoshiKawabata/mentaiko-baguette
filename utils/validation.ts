/**
 * バリデーション関数
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateRating(value: number | null): boolean {
  if (value === null) return true; // nullは許可
  return value >= 1 && value <= 5;
}

export function validatePrice(price: string): boolean {
  if (!price.trim()) return true; // 空は許可
  const num = parseInt(price, 10);
  return !isNaN(num) && num > 0;
}

