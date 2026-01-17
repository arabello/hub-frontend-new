import type { Config } from "@react-router/dev/config";
import {
  getUniquePackageNames,
  getAllPackageVersionPaths,
} from "./app/services/packages";

export default {
  basename: import.meta.env.PROD ? "/hub-frontend-new/" : "/",
  ssr: false,
  async prerender() {
    const packageNames = await getUniquePackageNames();
    const versionPaths = await getAllPackageVersionPaths();

    const paths = [
      "/",
      "/search",
      ...packageNames.slice(0, 3).map((name) => `/${name}`),
      ...versionPaths.slice(0, 3),
    ];

    console.log(
      `Prerendering ${paths.length} routes (${packageNames.length} packages, ${versionPaths.length} versions)`,
    );

    return paths;
  },
} satisfies Config;
