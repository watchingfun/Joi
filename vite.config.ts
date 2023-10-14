import fs from "node:fs";
import path from "node:path";
import { type Plugin, defineConfig, normalizePath } from "vite";
import vue from "@vitejs/plugin-vue";
import renderer from "vite-plugin-electron-renderer";
import electron from "vite-plugin-electron/simple";
import pkg from "./package.json";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import svgLoader from "vite-svg-loader";

export default defineConfig(({ command }) => {
  fs.rmSync("dist-electron", { recursive: true, force: true });
  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@@": path.resolve(__dirname, "electron"),
      },
    },
    plugins: [
      vue(),
      svgLoader(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      }),
      electron({
        main: {
          entry: "electron/main.ts",
          vite: {
            build: {
              minify: false,
              commonjsOptions: {
                ignoreDynamicRequires: true,
              },
            },
          },
        },
        preload: {
          input: path.join(__dirname, "electron/preload.ts"),
        },
      }),
      // Use Node.js API in the Renderer process
      renderer(),
      bindingSqlite3(),
    ],
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })(),
    clearScreen: false,
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`,
        },
      },
    },
  };
});

// https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L36
// https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L50
function bindingSqlite3(
  options: {
    output?: string;
    better_sqlite3_node?: string;
    command?: string;
  } = {},
): Plugin {
  const TAG = "[vite-plugin-binding-sqlite3]";
  options.output ??= "dist-native";
  options.better_sqlite3_node ??= "better_sqlite3.node";
  options.command ??= "build";

  return {
    name: "vite-plugin-binding-sqlite3",
    config(config) {
      console.log("config.root", config.root);
      // https://github.com/vitejs/vite/blob/v4.4.9/packages/vite/src/node/config.ts#L496-L499
      const resolvedRoot = normalizePath(
        config.root ? path.resolve(config.root) : process.cwd(),
      );
      const output = path.resolve(resolvedRoot, options.output as string);
      console.log("resolvedRoot", resolvedRoot);
      console.log("options.output", options.output);
      console.log("output", output);
      const better_sqlite3 = require.resolve("better-sqlite3");
      const better_sqlite3_root = path.join(
        better_sqlite3.slice(0, better_sqlite3.lastIndexOf("node_modules")),
        "node_modules/better-sqlite3",
      );
      const better_sqlite3_node = path.join(
        better_sqlite3_root,
        "build/Release",
        options.better_sqlite3_node as string,
      );
      const better_sqlite3_copy = path.join(
        output,
        options.better_sqlite3_node as string,
      );
      if (!fs.existsSync(better_sqlite3_node)) {
        throw new Error(`${TAG} Can not found "${better_sqlite3_node}".`);
      }
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
      }
      fs.copyFileSync(better_sqlite3_node, better_sqlite3_copy);
      /** `dist-native/better_sqlite3.node` */
      const BETTER_SQLITE3_BINDING = better_sqlite3_copy.replace(
        resolvedRoot + "/",
        "",
      );
      fs.writeFileSync(
        path.join(resolvedRoot, ".env"),
        `VITE_BETTER_SQLITE3_BINDING=${BETTER_SQLITE3_BINDING}`,
      );

      console.log(TAG, `binding to ${BETTER_SQLITE3_BINDING}`);
    },
  };
}
