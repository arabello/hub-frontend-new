import type { Config } from "@react-router/dev/config";
import {
  getUniquePackageNames,
  getAllPackageVersionPaths,
} from "./app/services/packages";

export default {
  // return a list of URLs to prerender at build time
  async prerender() {
    const packageNames = await getUniquePackageNames();
    const versionPaths = await getAllPackageVersionPaths();

    // Generate paths for home, all packages (latest), and all versioned packages
    const paths = [
      "/",
      ...packageNames.map((name) => `/${name}`),
      ...versionPaths,
    ];

    console.log(
      `Prerendering ${paths.length} routes (${packageNames.length} packages, ${versionPaths.length} versions)`,
    );

    return paths;
  },
} satisfies Config;
