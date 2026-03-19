const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const potentialMetroPaths = [
  path.join(rootDir, 'node_modules/metro/package.json'),
  path.join(rootDir, 'node_modules/metro-config/package.json'),
  path.join(rootDir, 'node_modules/metro-resolver/package.json'),
  path.join(rootDir, 'node_modules/metro-runtime/package.json'),
  path.join(rootDir, 'apps/mobile/node_modules/metro/package.json'),
  path.join(rootDir, 'apps/mobile/node_modules/metro-config/package.json'),
  path.join(rootDir, 'apps/mobile/node_modules/metro-resolver/package.json'),
  path.join(rootDir, 'apps/mobile/node_modules/metro-runtime/package.json'),
];

potentialMetroPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`[Patch] Checking ${p}...`);
    try {
      const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      let modified = false;

      if (pkg.name.startsWith('metro')) {
        console.log(`[Patch] Redefining exports for ${pkg.name} in ${p}`);
        
        // This map covers all known paths used by @expo/cli and internal metro packages
        pkg.exports = {
          ".": "./src/index.js",
          "./package.json": "./package.json",
          "./private/*": "./src/*.js",
          "./src/*.js": "./src/*.js",
          "./src/*": "./src/*.js",
          // Explicitly map nested folders that are often problematic
          "./src/lib/*": "./src/lib/*.js",
          "./src/shared/output/*": "./src/shared/output/*.js"
        };

        // For metro-config specifically, they sometimes need different defaults
        if (pkg.name === 'metro-config') {
           pkg.exports["./src/defaults/index"] = "./src/defaults/index.js";
           pkg.exports["./src/defaults/*"] = "./src/defaults/*.js";
        }

        modified = true;
      }

      if (modified) {
        fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
        console.log(`[Patch] Successfully updated ${p}`);
      } else {
        console.log(`[Patch] No changes needed for ${p}`);
      }
    } catch (err) {
      console.error(`[Patch] Error processing ${p}:`, err.message);
    }
  }
});
