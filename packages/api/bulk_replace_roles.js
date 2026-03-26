const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { from: /'DEPT_ADMIN'/g, to: "'HOD'" },
  { from: /'TEACHER'/g, to: "'FACULTY'" },
  // Expand SUPER_ADMIN to include MAIN_ADMIN in authorizeRoles
  { from: /authorizeRoles\('SUPER_ADMIN'\)/g, to: "authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN')" },
  { from: /authorizeRoles\('SUPER_ADMIN', 'HOD'\)/g, to: "authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD')" },
  // Handle some specific cases
  { from: /role === 'TEACHER'/g, to: "role === 'FACULTY'" },
  { from: /role: 'TEACHER'/g, to: "role: 'FACULTY'" },
  { from: /role === 'SUPER_ADMIN'/g, to: "['MAIN_ADMIN', 'SUPER_ADMIN'].includes(role)" },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.includes('auth.controller.ts') && !file.includes('seed.ts') && !file.includes('prisma.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

walk(srcDir);
