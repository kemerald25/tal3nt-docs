import { AdminClient } from "./AdminClient";
import { getBlogsData, getDocsData } from "@/lib/content";

export default async function AdminPage() {
  const [docs, blogs] = await Promise.all([getDocsData(), getBlogsData()]);
  return <AdminClient docs={docs} blogs={blogs} />;
}
