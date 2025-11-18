# AI-Powered Entity Extraction

## Overview
When Product Hunt launches are synced, they are automatically analyzed by Claude AI to extract structured information about companies, people, and create refined signals.

## Process Flow

### 1. Fetch Product Hunt Data
```
Product Hunt API → Raw Launch Data
- Product name, tagline, description
- Makers information
- Votes, comments, topics
- Website and social links
```

### 2. AI Analysis (Claude Haiku)
The AI analyzes each launch and extracts:

#### Company Information
- **Name**: Usually the product name
- **Description**: Brief company overview
- **Website**: Official website URL
- **Tags**: Relevant keywords (saas, ai, productivity, etc.)
- **Social Links**: Twitter, LinkedIn, GitHub

#### People Information
- **Name**: Full name of makers/founders
- **Title**: Role (Founder, CEO, Co-founder, Maker)
- **Tags**: Relevant labels (founder, entrepreneur, maker)
- **Social Links**: Twitter, LinkedIn, GitHub, personal website

#### Refined Signal
- **Headline**: Professional, concise (max 80 chars)
- **Summary**: Clear one-sentence description (max 150 chars)
- **Why It Matters**: 2-3 sentences on opportunity and traction
- **Recommended Action**: Specific next steps with contact info
- **Tags**: Relevant keywords for categorization

### 3. Database Integration

#### Company Creation/Update
```typescript
1. Check if company exists (by name)
2. If exists: Update with new information
3. If new: Create company record
4. Return company_id
```

#### People Creation/Update
```typescript
For each person:
1. Check if person exists (by name)
2. If exists: Update with new information
3. If new: Create person record with company link
4. Collect person_ids
```

#### Signal Creation
```typescript
Create signal with:
- AI-refined content
- Linked company_id and company_ids[]
- Linked person_ids[]
- Product Hunt enrichment data
- Auto-published status
```

## AI Prompt Structure

The AI receives:
- Product details (name, tagline, description)
- Maker information (names, usernames, Twitter handles)
- Engagement metrics (votes, comments)
- Topics/categories
- Website URL

The AI returns structured JSON with:
- Company object
- People array
- Signal object with refined content

## Fallback Mechanism

If AI is unavailable or fails:
1. **Company**: Use product name, tagline as description
2. **People**: Extract from makers list with basic info
3. **Signal**: Use template-based generation

## Benefits

### 1. Automatic Entity Recognition
- No manual data entry for companies
- Automatic people extraction from makers
- Proper role identification

### 2. Data Enrichment
- AI adds context and descriptions
- Extracts social links from text
- Identifies relevant tags

### 3. Quality Signals
- Professional headlines
- Clear, actionable content
- Proper context and recommendations

### 4. Relationship Building
- Automatic company-person linking
- Signal-company-person network
- Easy profile navigation

## Configuration

### Required Environment Variables
```bash
ANTHROPIC_API_KEY=your_claude_api_key
PRODUCT_HUNT_API_TOKEN=your_ph_token
```

### API Endpoint
```
POST /api/producthunt/sync
```

### Response Format
```json
{
  "success": true,
  "imported": 15,
  "skipped": 5,
  "total": 20,
  "errors": []
}
```

## Example Extraction

### Input (Product Hunt Launch)
```
Product: Cursor 2.0
Tagline: AI-first code editor
Makers: John Doe (@johndoe), Jane Smith (@janesmith)
Votes: 832
Topics: Developer Tools, AI, Productivity
```

### Output (AI Extracted)
```json
{
  "company": {
    "name": "Cursor",
    "description": "AI-first code editor for developers",
    "website": "https://cursor.sh",
    "tags": ["developer-tools", "ai", "code-editor"],
    "social_links": {
      "twitter": "cursor_ai"
    }
  },
  "people": [
    {
      "name": "John Doe",
      "title": "Co-founder",
      "tags": ["founder", "developer"],
      "social_links": {
        "twitter": "johndoe"
      }
    },
    {
      "name": "Jane Smith",
      "title": "Co-founder",
      "tags": ["founder", "developer"],
      "social_links": {
        "twitter": "janesmith"
      }
    }
  ],
  "signal": {
    "headline": "Product Launch — Cursor 2.0 - AI-First Code Editor",
    "summary": "AI-powered code editor with 832 upvotes on Product Hunt",
    "why_it_matters": "Strong Product Hunt launch with 832 upvotes indicates significant developer interest. AI-first approach positions them well in the growing AI developer tools market.",
    "recommended_action": "Reach out to @johndoe or @janesmith for partnership opportunities in AI development tools.",
    "tags": ["developer-tools", "ai", "productivity"]
  }
}
```

## Best Practices

1. **Review AI Extractions**: Periodically check extracted data for accuracy
2. **Update Prompts**: Refine AI prompts based on extraction quality
3. **Monitor Errors**: Check sync errors for patterns
4. **Deduplicate**: System automatically handles duplicate companies/people
5. **Enrich Profiles**: AI adds new info to existing profiles

## Future Enhancements

1. **Multi-source Analysis**: Combine PH data with website scraping
2. **Confidence Scores**: Rate extraction confidence
3. **Manual Review Queue**: Flag uncertain extractions
4. **Batch Processing**: Process multiple launches in parallel
5. **Learning System**: Improve extraction based on corrections
