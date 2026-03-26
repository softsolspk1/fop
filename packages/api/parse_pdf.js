const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function parsePdf(filename) {
  const filePath = path.join(__dirname, '..', '..', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filename} not found at ${filePath}`);
    return;
  }
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  console.log(`\n\n--- Content of ${filename} (First 2000 chars) ---`);
  console.log(data.text.substring(0, 2000));
}

async function main() {
  await parsePdf('c1.pdf');
  await parsePdf('catalogue.pdf');
  await parsePdf('courses.pdf');
}

main().catch(console.error);
