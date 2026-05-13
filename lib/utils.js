import { clsx, } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Single-pass URI encoding for static `/public` paths. If the string already
 * contains percent-escapes (e.g. from per-segment encodeURIComponent), decode
 * first so a later encodeURI does not turn `%20` into `%2520`.
 */
export function normalizePublicImagePath(src) {
  if (typeof src !== 'string') return src
  try {
    return encodeURI(decodeURIComponent(src))
  } catch {
    return encodeURI(src)
  }
}
