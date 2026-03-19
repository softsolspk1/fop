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

      if (pkg.exports) {
        console.log(`[Patch] Removing restrictive exports field from ${p}`);
        delete pkg.exports;
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
