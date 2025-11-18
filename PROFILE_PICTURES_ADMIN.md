# Profile Pictures Admin Guide

## Overview
You can now manage real profile pictures for both people and companies through the admin dashboard. This replaces the default SVG icons with actual images.

## Admin Pages

### Companies Logo Management
**URL**: `/admin/companies`

**Features**:
- View all companies with their current logos
- Edit logo URLs for any company
- Preview logos in real-time
- Search companies by name
- Fallback to building icon if logo fails to load

**How to Use**:
1. Go to `/admin/companies`
2. Find the company you want to update
3. Click "Edit Logo" 
4. Enter the image URL (e.g., `https://example.com/logo.png`)
5. Click "Save"

### People Avatar Management  
**URL**: `/admin/people`

**Features**:
- View all people with their current avatars
- Edit avatar URLs for any person
- Preview avatars in real-time
- Search people by name or company
- Show social media links
- Fallback to user icon if avatar fails to load

**How to Use**:
1. Go to `/admin/people`
2. Find the person you want to update
3. Click "Edit Avatar"
4. Enter the image URL (e.g., `https://example.com/avatar.jpg`)
5. Click "Save"

## Image Requirements

### Recommended Image Formats
- **JPG/JPEG** - Best for photos
- **PNG** - Best for logos with transparency
- **WebP** - Modern format, smaller file sizes

### Size Recommendations
- **Company Logos**: 200x200px minimum, square aspect ratio preferred
- **People Avatars**: 200x200px minimum, square aspect ratio preferred

### Image Sources
- Company websites (usually in `/press` or `/about` sections)
- LinkedIn profile pictures
- GitHub avatars
- Twitter profile pictures
- Professional headshots
- Company press kits

## Database Storage

### Companies Table
- `logo_url` field stores the image URL
- Updates automatically set `updated_at` timestamp

### People Table  
- `avatar_url` field stores the image URL
- Updates automatically set `updated_at` timestamp

## Frontend Display

### Companies Page (`/desk/companies`)
- Shows company logos in a 48x48px container
- Fallback to building icon if logo fails
- Logos are displayed in company cards

### People Page (`/desk/people`)
- Shows avatars in a 48x48px circular container
- Fallback to user icon if avatar fails
- Avatars are displayed in people cards

## API Endpoints

### Update Company Logo
```
PUT /api/companies/{id}
Content-Type: application/json

{
  "logo_url": "https://example.com/logo.png"
}
```

### Update Person Avatar
```
PATCH /api/people/{id}
Content-Type: application/json

{
  "avatar_url": "https://example.com/avatar.jpg"
}
```

## Tips for Finding Images

### For Company Logos
1. Check the company's website `/press` or `/about` page
2. Look for "Brand Assets" or "Press Kit" sections
3. Use Google Images: `site:company.com logo`
4. Check their social media profiles
5. Look on Crunchbase or AngelList

### For People Avatars
1. LinkedIn profile pictures (right-click → copy image address)
2. Twitter profile pictures
3. GitHub avatars
4. Company team pages
5. Professional photography websites

## Error Handling
- Invalid URLs will show fallback icons
- Broken images automatically fall back to default icons
- Network errors are handled gracefully
- All updates are logged for debugging

## Security Notes
- Only image URLs are stored, not files
- Images are loaded from external sources
- No file uploads to prevent security issues
- URLs are validated on the frontend

## Next Steps
1. Start with high-profile companies and people
2. Prioritize YC companies and founders
3. Add images for people with social media presence
4. Consider batch import tools for efficiency