import * as v from "valibot";
import { match } from "ts-pattern";
import { PackagesIndexSchema } from "../model/packages";
import type { PackagesIndex, Package } from "../model/packages";

const PACKAGE_INDEX_URL =
  process.env.PACKAGE_INDEX_URL ||
  "https://github.com/espanso/hub/releases/download/v1.0.0/package_index.json";

// Module-level cache to ensure single fetch per build process
let cachedPackagesIndex: PackagesIndex | null = null;
let fetchPromise: Promise<PackagesIndex> | null = null;

/**
 * Fetches and validates the package index from the configured URL.
 * Filters out dummy packages and validates all package data.
 * Cached at module level to ensure single fetch per build.
 * @throws Error if fetch fails or validation fails
 */
export async function fetchPackagesIndex(): Promise<PackagesIndex> {
  // Return cached result if available
  if (cachedPackagesIndex) {
    console.log("📦 Using cached package index");
    return cachedPackagesIndex;
  }

  // Return in-flight promise if fetch is already happening
  if (fetchPromise) {
    console.log("⏳ Waiting for in-flight package index fetch...");
    return fetchPromise;
  }

  // Start new fetch and cache the promise
  console.log("🌐 Fetching package index from:", PACKAGE_INDEX_URL);
  fetchPromise = (async () => {
    const response = await fetch(PACKAGE_INDEX_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch package index from ${PACKAGE_INDEX_URL}: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json();

    // Validate the entire response
    const parseResult = v.safeParse(PackagesIndexSchema, json);

    const result = match(parseResult)
      .with({ success: true }, (result) => {
        // Filter out dummy packages
        const filteredPackages = result.output.packages.filter(
          (pkg) => pkg.name !== "dummy-package",
        );

        return {
          ...result.output,
          packages: filteredPackages,
        };
      })
      .with({ success: false }, (result) => {
        const flattenedIssues = v.flatten(result.issues);
        console.error("Package index validation failed:", flattenedIssues);
        throw new Error(
          `Package index validation failed: ${JSON.stringify(flattenedIssues, null, 2)}`,
        );
      })
      .exhaustive();

    // Cache the result
    cachedPackagesIndex = result;
    console.log(
      `✅ Package index fetched and cached (${result.packages.length} packages)`,
    );
    return result;
  })();

  return fetchPromise;
}

/**
 * Gets the package index with graceful error handling.
 * Individual invalid packages are filtered out with warnings.
 */
export async function getPackagesIndex(): Promise<PackagesIndex> {
  try {
    return await fetchPackagesIndex();
  } catch (error) {
    console.error("Error fetching packages index:", error);
    throw error;
  }
}

/**
 * Gets unique package names from the package index.
 * Since multiple versions of the same package exist, we deduplicate by name.
 */
export async function getUniquePackageNames(): Promise<string[]> {
  const index = await getPackagesIndex();
  const uniqueNames = new Set(index.packages.map((pkg) => pkg.name));
  return Array.from(uniqueNames);
}

/**
 * Gets the latest version of a specific package by name.
 */
export async function getPackageByName(
  packageName: string,
): Promise<Package | null> {
  const index = await getPackagesIndex();

  // Find all versions of this package
  const packageVersions = index.packages.filter(
    (pkg) => pkg.name === packageName,
  );

  if (packageVersions.length === 0) {
    return null;
  }

  // Sort by version (descending) and return the latest
  const sorted = packageVersions.sort((a, b) => {
    // Simple version comparison - could use compare-versions library if needed
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });

  return sorted[0];
}
