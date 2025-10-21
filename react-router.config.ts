import type { Config } from "@react-router/dev/config";
import { getUniquePackageNames } from "./app/services/packages";

export default {
  // return a list of URLs to prerender at build time
  async prerender() {
    const packageNames = await getUniquePackageNames();

    // Generate paths for home and all packages
    const paths = ["/", ...packageNames.map((name) => `/${name}`)];

    console.log(
      `Prerendering ${paths.length} routes (${packageNames.length} packages)`,
    );

    return paths;
  },
} satisfies Config;
