import { hasAccess } from "@/server/access";
import { getState } from "@/server/store";
import { notFound } from "next/navigation";
import Dashboard from "./dashboard";

export default async function Home({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  if (!hasAccess(key)) notFound();
  return <Dashboard accessKey={key!} initialState={await getState()} />;
}
