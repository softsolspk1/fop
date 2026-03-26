const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /'DEPT_ADMIN'/g, to: "'HOD'" },
  { from: /"DEPT_ADMIN"/g, to: '"HOD"' },
  { from: /'TEACHER'/g, to: "'FACULTY'" },
  { from: /"TEACHER"/g, to: '"FACULTY"' },
  // Generalizing SUPER_ADMIN checks to include MAIN_ADMIN
  { from: /user\?.role === 'SUPER_ADMIN'/g, to: "['MAIN_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')" },
  { from: /user\.role === 'SUPER_ADMIN'/g, to: "['MAIN_ADMIN', 'SUPER_ADMIN'].includes(user.role)" },
  // Specifically for dashboard stats and similar
  { from: /user\?.role === 'SUPER_ADMIN' \|\| user\?.role === 'HOD'/g, to: "['MAIN_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'HOD'].includes(user?.role || '')" },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      replacements.forEach(r => {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

const targetDir = process.argv[2] || '.';
console.log(`Starting role migration in: ${targetDir}`);
walk(targetDir);
console.log('Role migration complete.');
