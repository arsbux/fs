// Smart profile merging utilities to avoid duplication and enhance existing profiles

import { supabase } from './supabase';

interface CompanyData {
  name: string;
  description?: string;
  website?: string;
  tags?: string[];
  social_links?: Record<string, string>;
  industry?: string;
  location?: string;
  founded_year?: number;
  employee_count?: string;
  logo_url?: string;
}

interface PersonData {
  name: string;
  title?: string;
  bio?: string;
  email?: string;
  avatar_url?: string;
  company_id?: string;
  company_name?: string;
  tags?: string[];
  social_links?: Record<string, string>;
}

/**
 * Smart merge of company data - combines existing and new data intelligently
 */
function mergeCompanyData(existing: any, newData: CompanyData): any {
  return {
    // Keep existing description if it's longer/better, otherwise use new
    description: chooseBetterText(existing.description, newData.description),
    
    // Use new website if provided, otherwise keep existing
    website: newData.website || existing.website,
    
    // Merge tags - combine and deduplicate
    tags: mergeArrays(existing.tags || [], newData.tags || []),
    
    // Merge social links - combine objects
    social_links: { ...(existing.social_links || {}), ...(newData.social_links || {}) },
    
    // Use new data if provided, otherwise keep existing
    industry: newData.industry || existing.industry,
    location: newData.location || existing.location,
    founded_year: newData.founded_year || existing.founded_year,
    employee_count: newData.employee_count || existing.employee_count,
    logo_url: newData.logo_url || existing.logo_url,
    
    updated_at: new Date().toISOString(),
  };
}

/**
 * Smart merge of person data - combines existing and new data intelligently
 */
function mergePersonData(existing: any, newData: PersonData): any {
  return {
    // Use more specific title if available
    title: chooseBetterText(existing.title, newData.title),
    
    // Keep existing bio if longer, otherwise use new
    bio: chooseBetterText(existing.bio, newData.bio),
    
    // Use new email if provided, otherwise keep existing
    email: newData.email || existing.email,
    
    // Use new avatar if provided, otherwise keep existing
    avatar_url: newData.avatar_url || existing.avatar_url,
    
    // Update company info if provided
    company_id: newData.company_id || existing.company_id,
    company_name: newData.company_name || existing.company_name,
    
    // Merge tags - combine and deduplicate
    tags: mergeArrays(existing.tags || [], newData.tags || []),
    
    // Merge social links - combine objects
    social_links: { ...(existing.social_links || {}), ...(newData.social_links || {}) },
    
    updated_at: new Date().toISOString(),
  };
}

/**
 * Choose better text between existing and new (longer, more descriptive)
 */
function chooseBetterText(existing?: string, newText?: string): string | undefined {
  if (!existing && !newText) return undefined;
  if (!existing) return newText;
  if (!newText) return existing;
  
  // Prefer longer, more descriptive text
  if (newText.length > existing.length * 1.2) return newText;
  return existing;
}

/**
 * Merge arrays and remove duplicates (case-insensitive for strings)
 */
function mergeArrays(existing: string[], newItems: string[]): string[] {
  const combined = [...existing];
  
  for (const item of newItems) {
    const exists = combined.some(existingItem => 
      existingItem.toLowerCase() === item.toLowerCase()
    );
    if (!exists) {
      combined.push(item);
    }
  }
  
  return combined;
}

/**
 * Find or create company with smart merging
 */
export async function findOrCreateCompany(companyData: CompanyData): Promise<{ id: string; name: string } | null> {
  if (!companyData.name) return null;
  
  try {
    // First, try to find existing company by exact name match
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', companyData.name)
      .single();

    if (existingCompany) {
      console.log(`🔄 Merging data for existing company: ${companyData.name}`);
      
      // Merge the data intelligently
      const mergedData = mergeCompanyData(existingCompany, companyData);
      
      // Update with merged data
      await supabase
        .from('companies')
        .update(mergedData)
        .eq('id', existingCompany.id);
      
      console.log(`✅ Enhanced existing company: ${companyData.name}`);
      return { id: existingCompany.id, name: companyData.name };
    } else {
      // Create new company
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert([{
          name: companyData.name,
          description: companyData.description,
          website: companyData.website,
          tags: companyData.tags || [],
          social_links: companyData.social_links || {},
          industry: companyData.industry,
          location: companyData.location,
          founded_year: companyData.founded_year,
          employee_count: companyData.employee_count,
          logo_url: companyData.logo_url,
          created_at: new Date().toISOString(),
        }])
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`❌ Error creating company ${companyData.name}:`, error);
        return null;
      }
      
      console.log(`✅ Created new company: ${companyData.name}`);
      return newCompany;
    }
  } catch (error) {
    console.error(`❌ Error in findOrCreateCompany for ${companyData.name}:`, error);
    return null;
  }
}

/**
 * Validate if a name looks like a real person name
 */
function isValidPersonName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  
  // Must be reasonable length
  if (trimmedName.length < 3 || trimmedName.length > 50) return false;
  
  // Must contain a space (First Last format)
  if (!trimmedName.includes(' ')) return false;
  
  // Check for invalid patterns
  const invalidPatterns = [
    /^[a-z_]+$/i,                    // All lowercase with underscores
    /\d/,                           // Contains numbers
    /[_@#$%^&*()]/,                 // Contains special characters
    /^(user|developer|founder|maker|admin|test)$/i, // Generic roles
    /^(john|jane)\s+(doe|smith)$/i, // Common placeholder names
    /^[a-z]+[0-9]+$/i,              // Username patterns
    /^@/,                           // Starts with @
    /^(redacted|unknown|anonymous)$/i, // Placeholder names
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(trimmedName))) {
    return false;
  }
  
  // Check if each part looks like a real name part
  const nameParts = trimmedName.split(' ');
  if (nameParts.length < 2) return false;
  
  return nameParts.every(part => 
    part.length >= 2 && 
    /^[A-Za-z]+$/.test(part) && // Only letters
    part[0] === part[0].toUpperCase() // Starts with capital
  );
}

/**
 * Find or create person with smart merging
 */
export async function findOrCreatePerson(personData: PersonData): Promise<string | null> {
  if (!personData.name) return null;
  
  // Validate the person name before processing
  if (!isValidPersonName(personData.name)) {
    console.log(`🚫 Rejected invalid person name: "${personData.name}"`);
    return null;
  }
  
  try {
    // First, try to find existing person by name
    const { data: existingPerson } = await supabase
      .from('people')
      .select('*')
      .ilike('name', personData.name)
      .single();

    if (existingPerson) {
      console.log(`🔄 Merging data for existing person: ${personData.name}`);
      
      // Merge the data intelligently
      const mergedData = mergePersonData(existingPerson, personData);
      
      // Update with merged data
      await supabase
        .from('people')
        .update(mergedData)
        .eq('id', existingPerson.id);
      
      console.log(`✅ Enhanced existing person: ${personData.name}`);
      return existingPerson.id;
    } else {
      // Create new person
      const { data: newPerson, error } = await supabase
        .from('people')
        .insert([{
          name: personData.name,
          title: personData.title,
          bio: personData.bio,
          email: personData.email,
          avatar_url: personData.avatar_url,
          company_id: personData.company_id,
          company_name: personData.company_name,
          tags: personData.tags || [],
          social_links: personData.social_links || {},
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single();
      
      if (error) {
        console.error(`❌ Error creating person ${personData.name}:`, error);
        return null;
      }
      
      console.log(`✅ Created new person: ${personData.name}`);
      return newPerson.id;
    }
  } catch (error) {
    console.error(`❌ Error in findOrCreatePerson for ${personData.name}:`, error);
    return null;
  }
}

/**
 * Check for similar companies to avoid near-duplicates
 */
export async function findSimilarCompany(name: string): Promise<any | null> {
  try {
    // Look for companies with similar names (fuzzy matching)
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${name}%,name.ilike.%${name.replace(/\s+/g, '%')}%`);
    
    if (companies && companies.length > 0) {
      // Return the most similar one (could implement more sophisticated matching)
      return companies[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error finding similar company:', error);
    return null;
  }
}

/**
 * Deduplicate and merge similar profiles
 */
export async function deduplicateProfiles(): Promise<void> {
  console.log('🔄 Starting profile deduplication...');
  
  try {
    // Find potential company duplicates
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (companies) {
      const seen = new Set<string>();
      const duplicates: any[] = [];
      
      for (const company of companies) {
        const normalizedName = company.name.toLowerCase().trim();
        if (seen.has(normalizedName)) {
          duplicates.push(company);
        } else {
          seen.add(normalizedName);
        }
      }
      
      console.log(`Found ${duplicates.length} potential company duplicates`);
      
      // Could implement automatic merging logic here
      for (const duplicate of duplicates) {
        console.log(`Potential duplicate: ${duplicate.name} (ID: ${duplicate.id})`);
      }
    }
  } catch (error) {
    console.error('Error in deduplication:', error);
  }
}