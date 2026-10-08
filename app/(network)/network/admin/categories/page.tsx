import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { CreateCategoryForm, RenameCategoryForm } from "@/components/network/admin/CategoryForms";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";

export default async function AdminCategoriesPage() {
  await requireSuperAdmin();
  const tags = await prisma.categoryTag.findMany({
    include: { _count: { select: { profiles: true, jobs: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Categories">
        Skill tags used on vendor profiles and opportunities. Rename instead of deleting if people
        still use a tag.
      </AdminHeader>

      <section className="border-2 border-ht-line bg-ht-panel p-6">
        <CreateCategoryForm />
      </section>

      <div className="overflow-x-auto border-2 border-ht-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b-2 border-ht-line bg-ht-panel">
            <tr>
              <th className="ht-label px-4 py-3 text-ht-muted">Category</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Vendors</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Opportunities</th>
              <th className="ht-label px-4 py-3 text-ht-muted">Rename</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id} className="border-b border-ht-line last:border-b-0">
                <td className="px-4 py-3 font-medium text-ht-cream">{t.name}</td>
                <td className="px-4 py-3 text-ht-muted">{t._count.profiles}</td>
                <td className="px-4 py-3 text-ht-muted">{t._count.jobs}</td>
                <td className="px-4 py-3">
                  <RenameCategoryForm id={t.id} name={t.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
