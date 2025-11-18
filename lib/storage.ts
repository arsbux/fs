import { Signal, Company } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SIGNALS_FILE = path.join(DATA_DIR, 'signals.json');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(SIGNALS_FILE)) {
  fs.writeFileSync(SIGNALS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(COMPANIES_FILE)) {
  fs.writeFileSync(COMPANIES_FILE, JSON.stringify([]));
}

export const storage = {
  // Companies
  getCompanies: (): Company[] => {
    const data = fs.readFileSync(COMPANIES_FILE, 'utf-8');
    const companies = JSON.parse(data);
    
    // Ensure all companies have required fields with defaults
    return companies.map((company: any) => ({
      ...company,
      tags: company.tags || [],
      social_links: company.social_links || {},
      description: company.description || '',
      website: company.website || '',
      industry: company.industry || '',
      location: company.location || '',
      employee_count: company.employee_count || '',
      founded_year: company.founded_year || null,
      logo_url: company.logo_url || '',
      updated_at: company.updated_at || company.created_at,
    }));
  },
  
  addCompany: (company: Omit<Company, 'id' | 'created_at'>): Company => {
    const companies = storage.getCompanies();
    // Generate truly unique ID using timestamp + random string + counter
    let id: string;
    let attempts = 0;
    do {
      id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      attempts++;
    } while (companies.some(c => c.id === id) && attempts < 10);
    
    const newCompany: Company = {
      ...company,
      id,
      tags: company.tags || [],
      social_links: company.social_links || {},
      created_at: new Date().toISOString(),
    };
    companies.push(newCompany);
    fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
    return newCompany;
  },

  updateCompany: (id: string, updates: Partial<Company>): Company | null => {
    const companies = storage.getCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    companies[index] = { 
      ...companies[index], 
      ...updates,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
    return companies[index];
  },
  
  deleteCompany: (id: string): void => {
    const companies = storage.getCompanies().filter(c => c.id !== id);
    fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
  },

  // Signals
  getSignals: (): Signal[] => {
    const data = fs.readFileSync(SIGNALS_FILE, 'utf-8');
    return JSON.parse(data);
  },
  
  addSignal: (signal: Omit<Signal, 'id' | 'created_at'>): Signal => {
    const signals = storage.getSignals();
    // Generate unique ID using timestamp + random string
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newSignal: Signal = {
      ...signal,
      id,
      created_at: new Date().toISOString(),
    };
    signals.push(newSignal);
    fs.writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2));
    return newSignal;
  },
  
  updateSignal: (id: string, updates: Partial<Signal>): Signal | null => {
    const signals = storage.getSignals();
    const index = signals.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    signals[index] = { ...signals[index], ...updates };
    fs.writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2));
    return signals[index];
  },
  
  deleteSignal: (id: string): void => {
    const signals = storage.getSignals().filter(s => s.id !== id);
    fs.writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2));
  },

  // Users
  getUsers: (): any[] => {
    const USERS_FILE = path.join(DATA_DIR, 'users.json');
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  },

  addUser: (user: any): any => {
    const users = storage.getUsers();
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newUser = {
      ...user,
      id,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    const USERS_FILE = path.join(DATA_DIR, 'users.json');
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return newUser;
  },

  updateUser: (id: string, updates: any): any => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    const USERS_FILE = path.join(DATA_DIR, 'users.json');
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return users[index];
  },

  getUserByEmail: (email: string): any => {
    const users = storage.getUsers();
    return users.find(u => u.email === email);
  },


};
