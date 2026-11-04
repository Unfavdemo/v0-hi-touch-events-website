import { redirect } from "next/navigation";

/** Partner join is not part of HiTouch Events — Staffing. */
export default function PartnerJoinPage() {
  redirect("/network/unavailable");
}
