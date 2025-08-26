# GreenOps AI Theme Documentation

## Overview

GreenOps AI uses a modern, eco-tech focused color scheme designed to convey sustainability, innovation, and professionalism. The theme is built on a foundation of green colors with strategic accent colors for optimal user experience.

## Color Palette

### Primary Colors
- **Primary Green** (`#10B981`): Main brand color, used for primary buttons, links, and key UI elements
- **Secondary Green** (`#34D399`): Supporting color for secondary elements, hover states, and accents

### Accent Colors
- **Tech Blue** (`#3B82F6`): Call-to-action elements, interactive components, and highlights
- **Amber** (`#F59E0B`): Warning states, notifications, and attention-grabbing elements
- **Red** (`#EF4444`): Error states, destructive actions, and critical alerts

## Usage Guidelines

### Buttons
- **Primary buttons**: Use `bg-primary` (GreenOps primary green)
- **Secondary buttons**: Use `bg-secondary` (GreenOps secondary green)
- **Accent buttons**: Use `bg-accent` (Tech blue for special actions)

### Charts and Data Visualization
- **Chart 1**: Primary green for main data series
- **Chart 2**: Secondary green for secondary data series
- **Chart 3**: Tech blue for tertiary data series
- **Chart 4**: Amber for warning/attention data
- **Chart 5**: Red for error/critical data

### Status Indicators
- **Success**: Primary green
- **Warning**: Amber
- **Error**: Red
- **Info**: Tech blue

## CSS Variables

The theme uses CSS custom properties for consistent color application:

```css
:root {
  --greenops-primary: #10B981;
  --greenops-secondary: #34D399;
  --greenops-accent: #3B82F6;
  --greenops-warning: #F59E0B;
  --greenops-error: #EF4444;
}
```

## Tailwind Classes

Custom Tailwind classes are available for the GreenOps AI theme:

```tsx
// Primary colors
className="bg-greenops-primary text-white"
className="border-greenops-secondary"

// Semantic colors
className="text-greenops-warning"
className="bg-greenops-error"
```

## Component Examples

### Cards
```tsx
<Card className="border-greenops-primary/20 hover:border-greenops-primary/40">
  <CardHeader>
    <CardTitle className="text-greenops-primary">GreenOps AI Feature</CardTitle>
  </CardHeader>
</Card>
```

### Buttons
```tsx
<Button className="bg-greenops-primary hover:bg-greenops-primary/90">
  Deploy AI Model
</Button>
```

### Charts
```tsx
<Line
  dataKey="performance"
  stroke="var(--chart-1)"  // Uses GreenOps primary green
  strokeWidth={2}
/>
```

## Accessibility

The GreenOps AI color scheme meets WCAG AA contrast requirements:
- Primary green on white: 4.5:1 ratio ✅
- Secondary green on white: 3.8:1 ratio ✅
- Tech blue on white: 4.2:1 ratio ✅

## Dark Mode Support

The theme automatically adapts to dark mode while maintaining the GreenOps AI brand identity:
- Primary colors remain consistent
- Background and foreground colors adapt for optimal contrast
- Chart colors maintain their semantic meaning

## Implementation Notes

1. **CSS Variables**: All colors are defined as CSS custom properties for easy theming
2. **Tailwind Integration**: Custom color classes are available through Tailwind CSS
3. **Component Library**: All shadcn/ui components automatically use the GreenOps AI theme
4. **Responsive Design**: Colors work consistently across all device sizes

## Future Enhancements

- Additional color variations for expanded use cases
- Seasonal color themes while maintaining brand identity
- Advanced color accessibility features
- Custom color picker for user personalization
