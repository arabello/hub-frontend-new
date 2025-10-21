import type { Route } from "./+types/package";
import { getPackageByName } from "../services/packages";
import { match } from "ts-pattern";

export async function loader({ params }: Route.LoaderArgs) {
  const { packageName } = params;

  const pkg = await getPackageByName(packageName);

  return match(pkg)
    .with(null, () => {
      throw new Response("Package not found", { status: 404 });
    })
    .otherwise((p) => ({ package: p }));
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Package Not Found" }];
  }

  return [
    { title: `${data.package.title} - Espanso Hub` },
    { name: "description", content: data.package.description },
  ];
}

export default function PackageRoute({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.package.title}</div>;
}
