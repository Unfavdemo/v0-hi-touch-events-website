import { redirect } from "next/navigation";

/** Partner join removed — vendors apply directly. */
export default function JoinChooserPage() {
  redirect("/network/join/freelancer");
}
