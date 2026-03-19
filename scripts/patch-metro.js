const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const potentialMetroPaths = [
  path.join(rootDir, 'node_modules/metro/package.json'),
  path.join(rootDir, 'apps/mobile/node_modules/metro/package.json'),
  // Add more common hoisting locations if necessary
];

potentialMetroPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`[Patch] Checking ${p}...`);
    try {
      const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      let modified = false;

      if (pkg.exports) {
        // Fix for shared/output/bundle not exported
        if (!pkg.exports['./src/shared/output/bundle']) {
          pkg.exports['./src/shared/output/bundle'] = './src/shared/output/bundle.js';
          console.log(`[Patch] Added shared/output/bundle export to ${p}`);
          modified = true;
        }

        // Broaden src exports
        if (!pkg.exports['./src/*']) {
            pkg.exports['./src/*'] = './src/*.js';
            modified = true;
        }
        
        // Add specific folders that are often needed
        const extraExports = {
          './src/lib/*': './src/lib/*.js',
          './src/shared/output/*': './src/shared/output/*.js',
          './src/ModuleGraph/*': './src/ModuleGraph/*.js',
          './src/JSTransformer/worker': './src/JSTransformer/worker.js'
        };

        for (const [key, val] of Object.entries(extraExports)) {
          if (!pkg.exports[key]) {
            pkg.exports[key] = val;
            console.log(`[Patch] Added ${key} export to ${p}`);
            modified = true;
          }
        }
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
