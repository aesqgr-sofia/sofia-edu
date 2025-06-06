# Sofia Component Library

A modular, reusable component library for the Sofia application. This library provides consistent UI components, styling, and layout patterns to ensure a unified user experience throughout the application.

## Directory Structure

```
components/
├── common/             # Reusable UI components
│   ├── Button.js       # Button component
│   ├── Card.js         # Card component
│   ├── NavBar.js       # Navigation bar component
│   ├── Page.js         # Page layout component
│   └── index.js        # Export all common components
├── styles/             # CSS styles
│   ├── variables.css   # CSS variables and design tokens
│   ├── base.css        # Base/reset styles
│   ├── typography.css  # Typography styles
│   ├── utilities.css   # Utility classes
│   ├── layout.css      # Layout styles
│   ├── button.css      # Button styles
│   ├── navbar.css      # Navbar styles
│   └── index.css       # Main CSS import file
└── index.js            # Main export file
```

## Usage

### Importing Components

Import components directly from the components library:

```jsx
import { Button, Card, Page, NavBar } from '../components';
```

### Using Components

Components are designed to be flexible and customizable through props:

```jsx
// Button example
<Button 
  variant="primary" 
  size="medium" 
  onClick={handleClick}
>
  Click Me
</Button>

// Card example
<Card
  title="Card Title"
  headerActions={<Button variant="tertiary">Action</Button>}
  footerActions={<Button variant="primary">Save</Button>}
>
  Card content goes here
</Card>

// Page example
<Page
  title="Page Title"
  subtitle="Page description"
  headerActions={<Button variant="primary">Action</Button>}
>
  Page content goes here
</Page>
```

### Component Variants

Most components support multiple variants through props:

#### Button Variants

- `primary`: Main action buttons
- `secondary`: Secondary actions
- `tertiary`: Less prominent actions
- `danger`: Destructive actions

#### Button Sizes

- `small`: Compact buttons
- `medium`: Standard buttons (default)
- `large`: Prominent buttons

### CSS Classes

The library provides a comprehensive set of utility classes for common styling needs:

#### Layout Classes

- `.sofia-d-flex`: Display flex
- `.sofia-justify-between`: Justify content between
- `.sofia-items-center`: Align items center
- `.sofia-gap-{1-6}`: Gap spacing (1-6)

#### Spacing Classes

- `.sofia-m{t|r|b|l|x|y}-{1-6}`: Margin (top, right, bottom, left, x-axis, y-axis) with size 1-6
- `.sofia-p{t|r|b|l|x|y}-{1-6}`: Padding (top, right, bottom, left, x-axis, y-axis) with size 1-6

#### Color Classes

- `.sofia-text-primary`: Primary text color
- `.sofia-text-secondary`: Secondary text color
- `.sofia-bg-primary`: Primary background color
- `.sofia-bg-white`: White background

## Design Principles

1. **Consistency**: Components follow a consistent design language
2. **Modularity**: Components are modular and can be composed together
3. **Flexibility**: Components are customizable through props
4. **Accessibility**: Components are designed with accessibility in mind
5. **Responsiveness**: Components are responsive and work on all device sizes

## Adding New Components

When adding new components:

1. Create the component file in the appropriate directory
2. Create a CSS file if needed
3. Export the component from the directory's index.js file
4. Add the component to this README

## Styling Guidelines

- Use CSS variables for all colors, spacing, and typography
- Avoid hardcoded values for colors, spacing, and fonts
- Follow the naming convention: `sofia-[component]-[variant]`
- Use utility classes for common styling needs 