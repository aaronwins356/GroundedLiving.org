const Module = require("node:module");
const path = require("node:path");

const distRoot = path.resolve(__dirname, "..", ".tests-dist");
const originalResolve = Module._resolveFilename;

const aliasMap = new Map([
  ["@/", ""],
  ["@components/", "components/"],
  ["@lib/", "lib/"],
  ["@content/", "content/"],
  ["@project-types/", "types/"],
]);

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  for (const [alias, replacement] of aliasMap.entries()) {
    if (request.startsWith(alias)) {
      const mapped = path.join(distRoot, replacement + request.slice(alias.length));
      return originalResolve.call(this, mapped, parent, isMain, options);
    }
  }

  return originalResolve.call(this, request, parent, isMain, options);
};
