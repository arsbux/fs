// Fix duplicate company IDs in companies.json
import fs from 'fs';
import path from 'path';

const COMPANIES_FILE = path.join(process.cwd(), 'data', 'companies.json');

interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  tags: string[];
  created_at: string;
}

function fixDuplicates() {
  console.log('🔧 Fixing duplicate company IDs...\n');

  // Read companies
  const data = fs.readFileSync(COMPANIES_FILE, 'utf-8');
  const companies: Company[] = JSON.parse(data);

  console.log(`Total companies: ${companies.length}`);

  // Find duplicates
  const idCounts = new Map<string, number>();
  companies.forEach(c => {
    idCounts.set(c.id, (idCounts.get(c.id) || 0) + 1);
  });

  const duplicateIds = Array.from(idCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([id]) => id);

  console.log(`Duplicate IDs found: ${duplicateIds.length}`);
  duplicateIds.forEach(id => {
    console.log(`  - ${id} (${idCounts.get(id)} occurrences)`);
  });

  if (duplicateIds.length === 0) {
    console.log('\n✅ No duplicates found!');
    return;
  }

  // Fix duplicates by regenerating IDs
  const seenIds = new Set<string>();
  const fixed: Company[] = [];

  companies.forEach(company => {
    if (seenIds.has(company.id)) {
      // Duplicate found - generate new ID
      const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`  Fixing: ${company.name} (${company.id} → ${newId})`);
      fixed.push({
        ...company,
        id: newId,
      });
      seenIds.add(newId);
    } else {
      // First occurrence - keep it
      fixed.push(company);
      seenIds.add(company.id);
    }
  });

  // Write back
  fs.writeFileSync(COMPANIES_FILE, JSON.stringify(fixed, null, 2));

  console.log(`\n✅ Fixed ${companies.length - fixed.length} duplicates`);
  console.log(`✅ Total companies after fix: ${fixed.length}`);
}

fixDuplicates();
