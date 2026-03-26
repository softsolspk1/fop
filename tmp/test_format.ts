const testData = "1. \nCase Study: Urinary Tract Infection in First-Trimester Pregnancy – Antibiotic Selection and Fetal  \n \n \n \nSafety\n \n \n2. \nCase Study: Nausea and Vomiting in Early Pregnancy – Safe Pharmacological Management\n \n \n3. \nCase Study: Hypertension, Eclampsia & Preeclampsia at 24 Weeks – Antihypertensive Therapy  \n \n \n \nand Maternal-Fetal Safety";

const parseToItems = (text: string) => {
  if (!text) return [];
  // 1. Normalize whitespace: replace multiple newlines/spaces with a single space within blocks
  // but keep newlines that separate items if possible.
  // Actually, let's just collapse everything into a single line then split by numbers.
  let collapsed = text.replace(/\s+/g, ' ');
  
  // 2. Split by number pattern "1. ", "2. " etc.
  const items = collapsed.split(/\s*(?=\d+\.)/).map(i => i.trim()).filter(i => i !== '');
  return items;
};

console.log('Original:', testData);
console.log('Parsed Items:', JSON.stringify(parseToItems(testData), null, 2));
