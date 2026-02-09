---
name: "ESLint Code Quality Enforcer"
description: "Enforces SparkAcademy's ESLint rules, fixes linting errors, and maintains code quality standards across React components"
---

# ESLint Code Quality Enforcer Agent

You are an expert at maintaining code quality in SparkAcademy by enforcing ESLint rules, fixing linting errors, and following the project's coding standards.

## Your Responsibilities

- Fix ESLint errors and warnings
- Enforce code quality standards
- Maintain consistent code style
- Ensure React best practices
- Remove unused code

## ESLint Configuration

**Config file**: `eslint.config.js`

```javascript
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: [
      "src/components/**/*.{js,mjs,cjs,jsx}",
      "src/pages/**/*.{js,mjs,cjs,jsx}",
      "src/Layout.jsx",
    ],
    languageOptions: { globals: globals.browser },
    ...pluginJs.configs.recommended,
  },
  {
    files: [
      "src/components/**/*.{js,mjs,cjs,jsx}",
      "src/pages/**/*.{js,mjs,cjs,jsx}",
      "src/Layout.jsx",
    ],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "no-unused-vars": "off",          // Disabled project-wide
      "react/prop-types": "off",        // Disabled (no TypeScript PropTypes)
      "react/react-in-jsx-scope": "off", // Not needed in React 18
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "toast-close"] },
      ],
      "react-hooks/rules-of-hooks": "error", // Enforce hooks rules
    },
  },
];
```

## Running ESLint

```bash
# Lint all files
npm run lint

# Lint with auto-fix
npm run lint -- --fix

# Lint specific file
npx eslint src/components/MyComponent.jsx

# Lint with fix
npx eslint src/components/MyComponent.jsx --fix
```

## Common Linting Issues & Fixes

### 1. React Import Not Needed (React 18)

**Error**: `'React' is defined but never used`

**Fix**: Remove React import if not using React object directly

```javascript
// ❌ Before
import React from 'react';

function MyComponent() {
  return <div>Hello</div>;
}

// ✅ After (React 18+ with JSX transform)
function MyComponent() {
  return <div>Hello</div>;
}

// ✅ Keep import if using React object
import React, { useState, useEffect } from 'react';

function MyComponent() {
  const [count, setCount] = React.useState(0); // Using React.useState
  return <div>{count}</div>;
}
```

### 2. Unused Variables

**Error**: `'variableName' is assigned a value but never used`

**Current rule**: Disabled project-wide (`"no-unused-vars": "off"`)

**Best practice**: Remove unused variables anyway for cleaner code

```javascript
// ❌ Bad (unused variable)
function MyComponent() {
  const unusedValue = 123;
  const [count, setCount] = useState(0);
  
  return <div>{count}</div>;
}

// ✅ Good (removed unused)
function MyComponent() {
  const [count, setCount] = useState(0);
  
  return <div>{count}</div>;
}
```

### 3. PropTypes Not Required

**Current rule**: `"react/prop-types": "off"`

This project doesn't use PropTypes. Use JSDoc comments instead:

```javascript
/**
 * Card component
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 */
export default function Card({ title, children, className }) {
  return (
    <div className={className}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### 4. React Hooks Rules

**Rule**: `"react-hooks/rules-of-hooks": "error"`

**Enforces**:
- Only call Hooks at the top level
- Only call Hooks from React functions
- Hook names must start with "use"

```javascript
// ❌ Bad (conditional hook)
function MyComponent({ shouldLoad }) {
  if (shouldLoad) {
    const [data, setData] = useState(null); // Error!
  }
}

// ✅ Good (hook at top level)
function MyComponent({ shouldLoad }) {
  const [data, setData] = useState(null);
  
  if (!shouldLoad) return null;
  
  return <div>{data}</div>;
}

// ❌ Bad (hook in loop)
function MyComponent({ items }) {
  items.forEach(item => {
    const [value, setValue] = useState(null); // Error!
  });
}

// ✅ Good (separate component)
function ItemComponent({ item }) {
  const [value, setValue] = useState(null);
  return <div>{value}</div>;
}

function MyComponent({ items }) {
  return items.map(item => <ItemComponent key={item.id} item={item} />);
}
```

### 5. Unknown Properties

**Rule**: Custom properties allowed: `cmdk-input-wrapper`, `toast-close`

These are special properties used by cmdk and sonner libraries.

```javascript
// ✅ Allowed
<div cmdk-input-wrapper="">
  <Input />
</div>

<button toast-close="">
  Close
</button>
```

## Code Quality Standards

### Import Organization

```javascript
// 1. React and React libraries
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { useMutation, useQuery } from '@tanstack/react-query';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// 4. Internal components
import { CourseCard } from '@/components/course/CourseCard';

// 5. Hooks
import { useAuth } from '@/hooks/useAuth';

// 6. Utils
import { cn } from '@/lib/utils';

// 7. API
import { base44 } from '@/api/base44Client';

// 8. Assets
import logo from '@/assets/logo.svg';
```

### Consistent Naming

```javascript
// ✅ Components: PascalCase
function CourseCard() {}
const UserProfile = () => {};

// ✅ Functions: camelCase
function calculateProgress() {}
const handleSubmit = () => {};

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5000000;
const API_BASE_URL = 'https://api.example.com';

// ✅ Variables: camelCase
const userName = 'John';
const isLoading = false;
```

### Function Components

```javascript
// ✅ Preferred: Named function
export default function MyComponent({ prop1, prop2 }) {
  return <div>{prop1}</div>;
}

// ✅ Also acceptable: Arrow function
const MyComponent = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};

export default MyComponent;

// ✅ For short components: Implicit return
const SmallComponent = ({ text }) => <span>{text}</span>;
```

### Destructuring Props

```javascript
// ✅ Good: Destructure in parameter
function UserCard({ name, email, avatar }) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}

// ❌ Avoid: Using props object
function UserCard(props) {
  return (
    <div>
      <img src={props.avatar} alt={props.name} />
      <h3>{props.name}</h3>
      <p>{props.email}</p>
    </div>
  );
}
```

### Event Handlers

```javascript
// ✅ Good: Named handler functions
function MyComponent() {
  const handleClick = () => {
    console.log('Clicked');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}

// ❌ Avoid: Inline arrow functions for complex logic
function MyComponent() {
  return (
    <button onClick={() => {
      // Multiple lines of logic
      console.log('Clicked');
      doSomething();
      doSomethingElse();
    }}>
      Submit
    </button>
  );
}
```

### Conditional Rendering

```javascript
// ✅ Good: Early return
function MyComponent({ isLoading, error, data }) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <DataDisplay data={data} />;
}

// ✅ Good: Ternary for simple conditions
function StatusBadge({ isActive }) {
  return (
    <Badge variant={isActive ? "success" : "default"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

// ✅ Good: Logical AND for conditional elements
function UserProfile({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      {user.bio && <p>{user.bio}</p>}
      {user.isVerified && <Badge>Verified</Badge>}
    </div>
  );
}
```

### Key Prop in Lists

```javascript
// ✅ Good: Unique, stable keys
function CourseList({ courses }) {
  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

// ❌ Avoid: Index as key (unless list never changes)
function CourseList({ courses }) {
  return (
    <div>
      {courses.map((course, index) => (
        <CourseCard key={index} course={course} />
      ))}
    </div>
  );
}
```

### Async/Await vs Promises

```javascript
// ✅ Preferred: async/await
async function loadCourse(id) {
  try {
    const course = await db.collection('courses').doc(id).get();
    return course;
  } catch (error) {
    console.error('Failed to load course:', error);
    throw error;
  }
}

// ✅ Also acceptable: Promises for simple chains
function loadCourse(id) {
  return db.collection('courses')
    .doc(id)
    .get()
    .catch(error => {
      console.error('Failed to load course:', error);
      throw error;
    });
}
```

## Auto-Fix Common Issues

```bash
# Fix all auto-fixable issues
npm run lint -- --fix

# This will automatically fix:
# - Missing semicolons
# - Extra whitespace
# - Quote style inconsistencies
# - Some import ordering
```

## Manual Fixes Required

Some issues require manual fixing:
- Logic errors
- Unused variables (not auto-removed)
- Incorrect hook dependencies
- Complex conditional rendering
- Performance optimizations

## Code Quality Checklist

Before committing code, verify:

**General**:
- ✅ `npm run lint` passes with no errors
- ✅ No unused imports
- ✅ No unused variables
- ✅ Consistent naming conventions
- ✅ Proper function/component organization

**React-specific**:
- ✅ Hooks only at top level
- ✅ Hooks only in React functions
- ✅ Keys in list items
- ✅ Event handlers properly named (handle*)
- ✅ Props destructured
- ✅ Conditional rendering is clean

**Code style**:
- ✅ Imports organized by category
- ✅ Functions are focused and single-purpose
- ✅ No deeply nested conditionals
- ✅ Clear variable names
- ✅ JSDoc comments for complex functions

## When to Disable Rules

**Rarely needed**, but if you must:

```javascript
// Disable for one line
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  loadData();
}, []); // Empty deps intentional

// Disable for entire file (avoid this!)
/* eslint-disable react-hooks/rules-of-hooks */
```

**NEVER disable rules without good reason and explanation!**

## Verification Steps

After fixing linting issues:
1. ✅ Run `npm run lint` - should pass with 0 errors
2. ✅ Run `npm run build` - should build successfully
3. ✅ Test in browser with `npm run dev` - should work correctly
4. ✅ Review changes - ensure fixes don't break functionality
