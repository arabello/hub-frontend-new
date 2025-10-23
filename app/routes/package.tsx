import { Check, Copy, Github, Share2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { match } from "ts-pattern";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { isFeatured } from "~/model/packages";
import { Header } from "../components/Header";
import {
  getPackageByName,
  getPackageByNameAndVersion,
  getVersionsForPackage,
} from "../services/packages";
import type { Route } from "./+types/package";

export async function loader({ params }: Route.LoaderArgs) {
  const { packageName, version } = params;

  // If version is provided, fetch specific version; otherwise fetch latest
  const pkg = version
    ? await getPackageByNameAndVersion(packageName, version)
    : await getPackageByName(packageName);

  return match(pkg)
    .with(null, () => {
      throw new Response(
        version ? "Package version not found" : "Package not found",
        { status: 404 },
      );
    })
    .otherwise(async (p) => {
      const versions = await getVersionsForPackage(packageName);
      const isLatest = !version || versions[0] === version;
      return { package: p, versions, isLatest };
    });
}

export function meta({ data, params }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Package Not Found" }];
  }

  const title = params.version
    ? `${data.package.title} v${data.package.version} - Espanso Hub`
    : `${data.package.title} - Espanso Hub`;

  return [
    { title },
    { name: "description", content: data.package.description },
  ];
}

export default function PackageRoute({ loaderData }: Route.ComponentProps) {
  const { package: pkg, versions, isLatest } = loaderData;
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [sharecopied, setShareCopied] = useState(false);

  // Derive GitHub URL from archive_url
  const getGitHubUrl = (archiveUrl: string): string | null => {
    const match = archiveUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? `https://github.com/${match[1]}` : null;
  };

  const githubUrl = getGitHubUrl(pkg.archive_url);

  const installCommand = isLatest
    ? `espanso install ${pkg.name}`
    : `espanso install ${pkg.name} --version ${pkg.version}`;

  const copyToClipboard = async (
    text: string,
    setCopiedState: (val: boolean) => void,
  ) => {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleVersionChange = (version: string) => {
    if (version === versions[0]) {
      navigate(`/${pkg.name}`);
    } else {
      navigate(`/${pkg.name}/v/${version}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/search?t=${tag}`);
  };

  const handleShare = () => {
    const url = window.location.href;
    copyToClipboard(url, setShareCopied);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="content-row py-8 flex flex-col gap-5">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-2">
              {/* Package Header */}
              <div className="space-y-4">
                {/* Title and Featured Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <h1 className="text-4xl md:text-5xl font-bold">
                      {pkg.title}
                    </h1>
                    {isFeatured(pkg) && (
                      <Badge variant="default" className="mt-2">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Actions Row */}
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                      {sharecopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>

                    {githubUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View on GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    {/* Version Selector */}
                    <Select
                      value={pkg.version}
                      onValueChange={handleVersionChange}
                    >
                      <SelectTrigger>Select version</SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version} value={version}>
                            v{version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-row items-end">
                  <div className="flex flex-2 flex-col gap-5">
                    {/* Package Name */}
                    <p className="font-mono text-sm text-muted-foreground">
                      {pkg.name}
                    </p>

                    {/* Author */}
                    <p className="text-sm text-muted-foreground">
                      by {pkg.author}
                    </p>

                    {/* Description */}
                    <p className="text-base leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Tags */}
                    {pkg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pkg.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Install Box */}
                  <div className="flex flex-1 flex-col gap-5">
                    <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                      {installCommand}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => copyToClipboard(installCommand, setCopied)}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description Content */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {pkg.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
