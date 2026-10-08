import { redirect } from "next/navigation"

/** /network → login for the member-network test surface. */
export default function NetworkIndexPage() {
  redirect("/network/login")
}
