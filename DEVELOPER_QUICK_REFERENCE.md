# Sofia Developer Quick Reference

## 🚀 Getting Started

### Project Setup
```bash
# Clone and setup
git clone <repository-url>
cd sofia

# Frontend setup
cd frontend
npm install
npm start

# Backend setup
cd ../backend
python -m venv sofia_venv
source sofia_venv/bin/activate  # On Windows: sofia_venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Development Workflow
```bash
# Start development servers
# Terminal 1: Frontend
cd frontend && npm start

# Terminal 2: Backend  
cd backend && python manage.py runserver

# Terminal 3: Watch for changes
npm run build:watch
```

## 🏗️ Architecture Quick Guide

### Frontend Structure
```
frontend/src/
├── components/          # Reusable UI components
│   ├── common/         # Basic UI elements (Button, Card, Modal)
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── business/       # Business logic components
├── pages/              # Route-level components
├── contexts/           # React context providers
├── hooks/              # Custom hooks
├── services/           # API services
└── utils/              # Utility functions
```

### Key Components Map
| Component | Purpose | Lines | Complexity |
|-----------|---------|-------|------------|
| `LearningSituationEditor.js` | Create/edit learning situations | 1095 | Very High |
| `ModuleCreationPage.js` | Create/edit modules | 865 | High |
| `SubjectLearningDragDrop.js` | Planning interface | 950 | High |
| `Content.js` | Content management | 762 | Medium |
| `Dashboard.js` | Overview page | 314 | Low |

## 🔧 Common Patterns

### API Calls Pattern
```javascript
// Standard API call pattern
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get('/api/endpoint/', {
      headers: { Authorization: `Token ${authToken}` }
    });
    
    setData(response.data);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch data');
  } finally {
    setLoading(false);
  }
};
```

### Form Handling Pattern
```javascript
// Standard form pattern
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  
  try {
    setLoading(true);
    await submitData(formData);
    showToast('Success!');
  } catch (err) {
    setError(err.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

### Modal State Pattern
```javascript
// Standard modal pattern
const [showModal, setShowModal] = useState(false);
const [editingItem, setEditingItem] = useState(null);

const handleEdit = (item) => {
  setEditingItem(item);
  setShowModal(true);
};

const handleClose = () => {
  setShowModal(false);
  setEditingItem(null);
};
```

## 📚 Component Guidelines

### Component Size Limits
- **Small Components**: < 100 lines
- **Medium Components**: 100-200 lines  
- **Large Components**: 200-500 lines
- **Refactor Required**: > 500 lines

### State Management Rules
- **Max useState hooks**: 5 per component
- **Complex state**: Use useReducer
- **Global state**: Use Context API
- **API state**: Consider React Query

### Function Guidelines
- **Max function size**: 30 lines
- **Complex logic**: Extract to custom hooks
- **Reusable logic**: Move to utils/services
- **Event handlers**: Use useCallback for optimization

## 🎨 Styling Conventions

### CSS Organization
```
ComponentName/
├── index.js              # Main component
├── ComponentName.js      # Component logic
├── ComponentName.css     # Component styles
└── README.md             # Component documentation
```

### CSS Class Naming
```css
/* BEM-style naming */
.component-name { }
.component-name__element { }
.component-name--modifier { }

/* Sofia-specific prefixes */
.sofia-btn { }
.sofia-card { }
.sofia-modal { }
```

### Responsive Design
```css
/* Mobile-first approach */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

## 🔍 Debugging Guide

### Common Issues & Solutions

#### 1. Component Not Re-rendering
```javascript
// Problem: Object/array mutations
const updateData = () => {
  data.push(newItem); // ❌ Mutates original array
  setData(data);
};

// Solution: Create new objects/arrays
const updateData = () => {
  setData([...data, newItem]); // ✅ Creates new array
};
```

#### 2. Infinite useEffect Loops
```javascript
// Problem: Missing dependencies
useEffect(() => {
  fetchData(someId);
}, []); // ❌ Missing someId dependency

// Solution: Include all dependencies
useEffect(() => {
  fetchData(someId);
}, [someId]); // ✅ Includes dependency
```

#### 3. Memory Leaks
```javascript
// Problem: Not cleaning up subscriptions
useEffect(() => {
  const timer = setInterval(fetchData, 1000);
}, []); // ❌ No cleanup

// Solution: Clean up in return function
useEffect(() => {
  const timer = setInterval(fetchData, 1000);
  return () => clearInterval(timer); // ✅ Cleanup
}, []);
```

### Debug Tools
```javascript
// React Developer Tools
// Install browser extension for component inspection

// Console debugging
console.log('Component rendered:', { props, state });

// Performance debugging
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render performance:', { id, phase, actualDuration });
};

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## 🧪 Testing Guidelines

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

test('handles user interaction', () => {
  const handleClick = jest.fn();
  render(<MyComponent onClick={handleClick} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react';
import useCustomHook from './useCustomHook';

test('hook returns expected values', () => {
  const { result } = renderHook(() => useCustomHook());
  
  expect(result.current.data).toBe(null);
  expect(result.current.loading).toBe(false);
});
```

## 🚀 Performance Tips

### Optimization Checklist
- [ ] Use React.memo for expensive components
- [ ] Implement useMemo for expensive calculations
- [ ] Use useCallback for event handlers
- [ ] Lazy load large components
- [ ] Optimize bundle size with code splitting

### Performance Monitoring
```javascript
// Measure component render time
const MyComponent = () => {
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    console.log(`Render time: ${endTime - startTime}ms`);
  });
  
  return <div>Component content</div>;
};
```

## 🔐 Security Guidelines

### Authentication
```javascript
// Always check for auth token
const { authToken } = useContext(AuthContext);

if (!authToken) {
  return <Navigate to="/login" />;
}

// Include token in API calls
const headers = {
  Authorization: `Token ${authToken}`,
  'Content-Type': 'application/json'
};
```

### Data Sanitization
```javascript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// Use dangerouslySetInnerHTML safely
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

## 🐛 Common Gotchas

### React Gotchas
1. **State Updates are Asynchronous**: Use functional updates for dependent state changes
2. **Object Reference Equality**: React uses Object.is() for comparisons
3. **Event Handler Binding**: Use arrow functions or useCallback to avoid rebinding

### JavaScript Gotchas
1. **Array/Object Mutations**: Always create new instances for state updates
2. **Async/Await Error Handling**: Wrap in try-catch blocks
3. **Falsy Values**: Remember that 0, '', false, null, undefined are falsy

### CSS Gotchas
1. **CSS Specificity**: More specific selectors override less specific ones
2. **Box Model**: Remember margin, border, padding affect element size
3. **Flexbox/Grid**: Understand main/cross axis behavior

## 📞 Getting Help

### Resources
- **React Docs**: https://reactjs.org/docs
- **MDN Web Docs**: https://developer.mozilla.org/
- **Sofia Architecture**: See `CODEBASE_DOCUMENTATION.md`
- **Component Analysis**: See `COMPONENT_ANALYSIS.md`

### Code Review Checklist
- [ ] Component follows single responsibility principle
- [ ] No more than 5 useState hooks
- [ ] Functions are under 30 lines
- [ ] Proper error handling implemented
- [ ] Performance considerations addressed
- [ ] Tests written for new functionality

This quick reference provides essential information for efficient development on the Sofia codebase. 