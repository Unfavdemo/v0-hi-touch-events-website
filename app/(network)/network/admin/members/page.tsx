import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";

export default async function AdminMembersRedirect() {
  await requireSuperAdmin();
  redirect("/network/admin/vendors");
}
