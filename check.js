const fs = require('fs');
const content = fs.readFileSync('d:/Inventory management/my app/project/types/supabase.ts', 'utf16le');
if (content.includes('organization_id') && content.includes('inventory')) {
  const match = content.match(/inventory(?:\s|\n|.)*?Row:\s*\{[\s\S]*?\}/);
  if (match) {
    console.log(match[0]);
  } else {
    console.log("Could not find inventory Row definition.");
  }
} else {
  console.log("Does not contain organization_id and inventory.");
}
