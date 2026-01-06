import type { Route } from "./+types/home";
import { getPackagesIndex } from "../services/packages";
import { Header } from "../components/Header";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { Link } from "react-router";

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
  const [searchValue, setSearchValue] = useState("");
  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div
      style={{ backgroundImage: "url(images/landing_bg.svg)" }}
      className="min-h-screen flex flex-col justify-between"
    >
      {/* {packages.packages.map((pkg) => (
        <li key={pkg.id}>{pkg.title}</li>
      ))} */}
      <div>
        <Header variant="landing" />

        <div className="content-row mt-48 text-center justify-items-center">
          <h1 className="text-4xl font-semibold text-white">
            Enhance your workflows with espanso packages
          </h1>
          <h2 className="text-xl mt-5 text-white">
            Emoji, code-snippets, mathematical notations, accents and more.
          </h2>
          <div className="flex min-w-1/3 relative mt-14">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Already got an idea? Search it here..."
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onSearchChange(e.target.value)
              }
              className="pl-10 min-w-1/3 min-h-12 bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-14 text-white">
            or{" "}
            <Link to="/search" className="underline">
              explore the hub
            </Link>
          </div>
        </div>
      </div>

      <div className="self-center pb-10 ">
        <ChevronDown className="text-white" />
      </div>
    </div>
  );
}
