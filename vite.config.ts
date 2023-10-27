import fs from "node:fs";
import path from "node:path";
import { defineConfig, normalizePath, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import renderer from "vite-plugin-electron-renderer";
import electron from "vite-plugin-electron/simple";
import pkg from "./package.json";
import { notBundle } from 'vite-plugin-electron/plugin'
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import svgLoader from "vite-svg-loader";

export default defineConfig(({ command }) => {
  fs.rmSync("dist-electron", { recursive: true, force: true });
  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe;

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@@": path.resolve(__dirname, "electron"),
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      svgLoader(),
      AutoImport({
        imports: [
          "vue",
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
      electron({
        main: {
          entry: "electron/main.ts",
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              commonjsOptions: {
                ignoreDynamicRequires: true,
              },
            },
            plugins: [
              // This is just an option to improve build performance, it's non-deterministic!
              // e.g. `import log from 'electron-log'` -> `const log = require('electron-log')`
              isServe && notBundle(),
            ],
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
    clearScreen: false,
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
      // https://github.com/vitejs/vite/blob/v4.4.9/packages/vite/src/node/config.ts#L496-L499
      const resolvedRoot = normalizePath(
        config.root ? path.resolve(config.root) : process.cwd(),
      );
      const output = path.resolve(resolvedRoot, options.output as string);
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
