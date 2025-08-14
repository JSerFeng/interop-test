const runTest = require("./helpers/runTest");
const execNode = require("./helpers/execNode");
const path = require("path");
const fs = require("fs");
const tmpPath = path.resolve(__dirname, `../dist`);

/** @type {import('@rspack/core')} */
let rspack;
runTest({
  name: "rspack",
  // packages: ["@rspack/core"],
  setup: () => {
    rspack = require("@rspack/core");
  },
  execute: async (filename, idx) => {
    return new Promise((resolve) =>
      rspack(
        {
          mode: "production",
          entry: `./src/${filename}`,
          target: "node",
          output: {
            path: path.resolve(__dirname, `../dist/${idx}`),
            chunkFormat: false,
            asyncChunks: false,
            chunkLoading: "import",
          },
          optimization: {
            emitOnErrors: true,
            minimize: false,
            concatenateModules: false,
            splitChunks: false,
            moduleIds: 'named'
          },
          plugins: [
            new rspack.experiments.RemoveDuplicateModulesPlugin(),
            new rspack.experiments.EsmLibraryPlugin(),
          ],
          experiments: { topLevelAwait: true },
        },
        (err, stats) => {
          if (err) return resolve("fatal error");
          resolve(
            (async () => {
              const result = await execNode(`dist/${idx}/main.js`);
              if (result.includes("error") && stats.hasErrors())
                return "compilation error";
              return (
                result +
                (stats.hasErrors() ? " + errors" : "") +
                (stats.hasWarnings() ? " + warnings" : "")
              );
            })()
          );
        }
      )
    );
  },
});
