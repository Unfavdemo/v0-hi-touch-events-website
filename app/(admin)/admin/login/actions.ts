"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import { validateDevLogin } from "@/lib/auth/dev-login"
import { isDevPasswordLoginEnabled } from "@/lib/auth/env"

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/admin" })
}

export async function signInWithDevCredentials(formData: FormData) {
  if (!isDevPasswordLoginEnabled()) {
    throw new Error("Dev sign-in is not enabled.")
  }

  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  const check = await validateDevLogin(email, password)
  if (!check.ok) {
    throw new Error(check.message)
  }

  try {
    await signIn("dev-credentials", {
      email: check.email,
      password: password.trim(),
      redirectTo: "/admin",
    })
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        throw new Error(
          "Sign-in failed after validation. Restart `npm run dev` and try again with the exact AUTH_DEV_PASSWORD from `.env`.",
        )
      }
      if (err.type === "AccessDenied") {
        throw new Error(
          "That email is not allowed for admin access. Add it to ADMIN_BOOTSTRAP_EMAILS or enable AUTH_DEV_ALLOW_ANY_GOOGLE.",
        )
      }
    }
    throw err
  }
}
