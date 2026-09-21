// Prisma's generated client uses .js-suffixed relative imports (per the
// project's `nodenext` module resolution), but only the .ts source files
// exist when running via ts-node against raw source (no compiled dist/
// output). Node's plain CJS resolver treats an explicit ".js" specifier as
// exact and won't fall back to ".ts", so requiring the generated client
// fails with MODULE_NOT_FOUND. This patches module resolution to retry with
// ".ts" when the literal ".js" path doesn't exist.
const Module = require('module');

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
  try {
    return originalResolveFilename.call(this, request, ...rest);
  } catch (error) {
    if (request.endsWith('.js')) {
      const tsRequest = request.slice(0, -3) + '.ts';
      return originalResolveFilename.call(this, tsRequest, ...rest);
    }
    throw error;
  }
};
