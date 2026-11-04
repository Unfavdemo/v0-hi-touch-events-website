import { redirect } from "next/navigation";

/** Partner portal is not part of HiTouch Events — Staffing. */
export default function PartnerLayout() {
  redirect("/network/unavailable");
}
