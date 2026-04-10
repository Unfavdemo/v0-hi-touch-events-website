'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * next-themes injects an inline script to avoid theme flash; React 19 warns because
 * <script> in client trees is considered non-executable on the client. Marking the
 * node as application/json on the client removes the warning after SSR has already
 * run the script in the initial HTML. @see https://github.com/pacocoursey/next-themes/issues/387
 */
export function ThemeProvider({ children, ...props }) {
  const scriptProps =
    typeof window === 'undefined' ? undefined : { type: 'application/json' }

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  )
}
