# Profiles Architecture

## Overview
FounderSignal is built around three core profile types: **Companies**, **People**, and **Signals**. Each signal is connected to one or more companies and/or people, creating a rich network of intelligence.

## Core Entities

### 1. Companies
Companies are organizations being tracked for market intelligence.

**Fields:**
- Basic Info: name, description, website, logo
- Details: industry, location, founded year, employee count
- Social: Twitter, LinkedIn, GitHub links
- Metadata: tags, keywords, timestamps

**Features:**
- Company profile page showing all related signals
- Search and filter capabilities
- Clickable cards linking to detailed profiles
- Social media integration

**Routes:**
- List: `/desk/companies`
- Profile: `/desk/companies/[id]`
- API: `/api/companies`, `/api/companies/[id]`

### 2. People
People are individuals tracked for their activities, roles, and connections.

**Fields:**
- Basic Info: name, title, bio, email, avatar
- Company: company_id, company_name (relationship)
- Social: Twitter, LinkedIn, GitHub, personal website
- Metadata: tags, timestamps

**Features:**
- Person profile page showing all related signals
- Company affiliation with clickable links
- Contact information and social links
- Search and filter capabilities

**Routes:**
- List: `/desk/people`
- Profile: `/desk/people/[id]`
- API: `/api/people`, `/api/people/[id]`

### 3. Signals
Signals are intelligence items about market activities, events, or changes.

**Fields:**
- Content: headline, summary, why_it_matters, recommended_action
- Scoring: score (0-10), credibility (low/medium/high)
- Classification: signal_type, tags, status
- Relations: company_id, company_ids[], person_ids[]
- Source: source_link, Product Hunt enrichment
- Tracking: user_actions, timestamps

**Features:**
- Two-column grid layout with priority tabs
- Related companies and people shown as clickable links
- Action tracking (acted, useful, ignore)
- Product Hunt integration with maker info

**Routes:**
- List: `/desk` (All Signals)
- Product Hunt: `/desk/producthunt`
- API: `/api/signals`, `/api/signals/[id]`

## Relationships

### Signal → Company (Many-to-Many)
- Primary: `signal.company_id` (legacy, single company)
- Extended: `signal.company_ids[]` (multiple companies)
- Use case: Funding rounds, partnerships, acquisitions

### Signal → Person (Many-to-Many)
- `signal.person_ids[]` (array of person UUIDs)
- Use case: Founder activities, executive moves, maker launches

### Person → Company (Many-to-One)
- `person.company_id` (optional)
- `person.company_name` (denormalized for display)
- Use case: Employment, affiliation

## Navigation Structure

```
Desk Layout (Sidebar)
├── All Signals (/)
├── Companies (/companies)
│   └── Company Profile (/companies/[id])
├── People (/people)
│   └── Person Profile (/people/[id])
└── Product Hunt (/producthunt)
```

## Data Flow

### Creating a Signal
1. Select or create companies involved
2. Select or create people involved
3. Add signal details (headline, summary, etc.)
4. System automatically links entities via IDs

### Viewing Profiles
1. **Company Profile**: Shows all signals where company_id or company_ids includes this company
2. **Person Profile**: Shows all signals where person_ids includes this person
3. **Signal Card**: Shows clickable links to related companies and people

### Search & Discovery
- Companies: Search by name, description, tags
- People: Search by name, title, company, tags
- Signals: Filter by priority (high/medium/low)

## UI Components

### SignalCard
- Displays signal with score badge
- Shows related companies as clickable links
- Shows related people as clickable links
- Action buttons (acted, useful, ignore)

### CompanyCard
- Company name and description
- Tags and metadata
- Clickable to company profile

### PersonCard
- Avatar and name
- Title and company affiliation
- Social links preview
- Clickable to person profile

## Database Schema

### Tables
```sql
companies (
  id, name, description, website, logo_url,
  industry, location, founded_year, employee_count,
  tags[], keywords[], social_links{}, timestamps
)

people (
  id, name, title, bio, email, avatar_url,
  company_id, company_name, tags[],
  social_links{}, timestamps
)

signals (
  id, headline, summary, source_link,
  why_it_matters, recommended_action,
  score, credibility, signal_type, tags[],
  company_id, company_ids[], person_ids[],
  status, ph_*, user_actions[], timestamps
)
```

### Indexes
- `companies`: name, tags
- `people`: name, company_id
- `signals`: company_id, company_ids (GIN), person_ids (GIN)

## Future Enhancements

1. **Relationship Graph**: Visual network of companies, people, and signals
2. **Activity Timeline**: Chronological view of all activities per entity
3. **Smart Recommendations**: Suggest related companies/people based on signals
4. **Bulk Operations**: Tag multiple entities, batch actions
5. **Export Profiles**: PDF/CSV export of company/person profiles
6. **Notifications**: Alert when tracked companies/people appear in new signals
7. **Collections**: Group companies/people into custom lists
8. **Notes**: Add private notes to any profile

## Best Practices

1. **Always link signals to entities**: Every signal should have at least one company or person
2. **Use arrays for multiple relations**: Use company_ids[] and person_ids[] for complex signals
3. **Keep denormalized data in sync**: Update company_name when company changes
4. **Tag consistently**: Use standardized tags across all entity types
5. **Enrich profiles**: Add social links, logos, and metadata for better context
