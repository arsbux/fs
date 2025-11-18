# Design System

## Overview
Modern, minimalistic UI design with clean typography and subtle interactions.

## Color Palette

### Neutrals (Primary)
- **Background**: `bg-neutral-50` - Light gray background
- **Cards**: `bg-white` with `border-neutral-200`
- **Text Primary**: `text-neutral-900`
- **Text Secondary**: `text-neutral-600`
- **Text Muted**: `text-neutral-500`

### Accent Colors
- **Primary Action**: `bg-neutral-900` (Black buttons)
- **Success**: `bg-emerald-50/600/700` (Green states)
- **Warning**: `bg-amber-50/600/700` (Medium priority)
- **Error**: `bg-red-50/600/700` (High priority)
- **Info**: `bg-blue-50/600/700` (Information)
- **Product Hunt**: `bg-orange-500/600` (Gradient)

## Typography

### Font Weights
- **Regular**: Default body text
- **Medium**: `font-medium` - Buttons, labels
- **Semibold**: `font-semibold` - Subheadings
- **Bold**: `font-bold` - Main headings

### Tracking
- **Tight**: `tracking-tight` - Large headings
- **Wide**: `tracking-wide` - Small uppercase labels

## Components

### Buttons
```tsx
// Primary
className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-800"

// Secondary
className="bg-neutral-100 text-neutral-900 px-6 py-2.5 rounded-lg font-medium hover:bg-neutral-200"

// With Icon
<Button>
  <Icon className="w-4 h-4" />
  Label
</Button>
```

### Cards
```tsx
className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-300 hover:shadow-sm transition-all"
```

### Inputs
```tsx
className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
```

### Badges
```tsx
// Status
className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"

// Tag
className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md"
```

### Score Indicators
```tsx
// High Priority (8-10)
className="bg-red-50 text-red-700 border-red-200"

// Medium Priority (6-7)
className="bg-amber-50 text-amber-700 border-amber-200"

// Low Priority (0-5)
className="bg-yellow-50 text-yellow-700 border-yellow-200"
```

## Layout

### Spacing
- **Container**: `max-w-4xl mx-auto px-6`
- **Section Padding**: `py-8`
- **Card Spacing**: `space-y-4`
- **Form Fields**: `space-y-5`

### Borders
- **Default**: `border-neutral-200`
- **Hover**: `border-neutral-300`
- **Accent**: `border-l-2 border-blue-400` (Left accent)

### Rounded Corners
- **Small**: `rounded-md` (4px)
- **Medium**: `rounded-lg` (8px)
- **Large**: `rounded-xl` (12px)
- **Extra Large**: `rounded-2xl` (16px)

## Interactions

### Transitions
```tsx
className="transition-all" // Smooth all properties
className="transition-colors" // Color changes only
```

### Hover States
- **Cards**: Subtle border and shadow change
- **Buttons**: Darker background
- **Links**: Color change

### Focus States
- **Inputs**: Ring with `focus:ring-2 focus:ring-neutral-900`
- **Buttons**: Automatic browser focus

## Icons
Using `lucide-react` with consistent sizing:
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px)
- **Large**: `w-6 h-6` (24px)

## Pages

### Desk Layout
- Fixed sidebar (256px width)
- Main content with max-width container
- Clean header with subtle borders

### Signal Cards
- Rounded corners with subtle borders
- Score badge in top-left
- Color-coded priority system
- Action buttons at bottom
- Hover effects for interactivity

### Forms
- Consistent input styling
- Clear labels with proper spacing
- Primary action buttons
- Validation states

## Best Practices

1. **Consistency**: Use the same spacing, colors, and components throughout
2. **Hierarchy**: Clear visual hierarchy with typography and spacing
3. **Feedback**: Hover and focus states on all interactive elements
4. **Accessibility**: Proper contrast ratios and focus indicators
5. **Performance**: Minimal animations, CSS transitions only
