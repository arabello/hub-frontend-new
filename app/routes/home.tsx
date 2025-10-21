import type { Route } from "./+types/home";
import { getPackagesIndex } from "../services/packages";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const packages = await getPackagesIndex();
  return { packages };
}

export default function Home({
  loaderData: { packages },
}: Route.ComponentProps) {
  return (
    <ul>
      {packages.packages.map((pkg) => (
        <li key={pkg.id}>{pkg.title}</li>
      ))}
    </ul>
  );
}
