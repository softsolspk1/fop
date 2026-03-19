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
        // Fix for TerminalReporter not exported
        if (!pkg.exports['./src/lib/TerminalReporter']) {
          pkg.exports['./src/lib/TerminalReporter'] = './src/lib/TerminalReporter.js';
          console.log(`[Patch] Added TerminalReporter export to ${p}`);
          modified = true;
        }

        // Broaden src exports if they are too restrictive
        if (pkg.exports['./src/*'] && pkg.exports['./src/*'] === './src/*.js') {
           // Change from top-level only to recursive or broader
           // Metro uses .js for its source
           pkg.exports['./src/*'] = './src/*.js'; // This is actually same, but let's make it recursive if Node allows or just explicitly add folders
        }
        
        // Explicitly add lib/ for safety
        if (!pkg.exports['./src/lib/*']) {
            pkg.exports['./src/lib/*'] = './src/lib/*.js';
            modified = true;
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
