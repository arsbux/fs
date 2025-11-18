import { SignalType } from '@/types';

export const SIGNAL_TYPES: { value: SignalType; label: string }[] = [
  { value: 'funding', label: 'Funding Event' },
  { value: 'hiring', label: 'Hiring Signal' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'partnership', label: 'Partnership/Integration' },
  { value: 'pricing_change', label: 'Pricing/Monetization Change' },
  { value: 'growth_hiring', label: 'Growth Roles Hiring' },
  { value: 'layoffs', label: 'Layoffs/Reorg' },
  { value: 'sponsorship', label: 'Sponsorship/Ad Buys' },
  { value: 'press_mention', label: 'Press Mention/Profile' },
  { value: 'community_traction', label: 'Community Traction' },
  { value: 'regulatory', label: 'Regulatory/Legal' },
  { value: 'signal_of_interest', label: 'Signal of Interest' },
  { value: 'ai_startup', label: 'AI Startup' },
  { value: 'crypto_startup', label: 'Crypto/Web3 Startup' },
  { value: 'dev_tools_startup', label: 'Developer Tools Startup' },
  { value: 'fintech_startup', label: 'Fintech Startup' },
  { value: 'healthtech_startup', label: 'Healthtech Startup' },
  { value: 'climate_startup', label: 'Climate Tech Startup' },
  { value: 'marketplace_startup', label: 'Marketplace Startup' },
  { value: 'yc_startup', label: 'YC Startup' },
];

export const CREDIBILITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
