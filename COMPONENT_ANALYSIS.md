# Sofia Components - Detailed Analysis

## 📊 Component Complexity Analysis

### 🔍 Large Components Breakdown

#### 1. LearningSituationEditor.js (1,095 lines)

**Purpose**: Create and edit learning situations with module selection and planning integration.

**Current Structure**:
```javascript
// State Management (30+ useState hooks)
const [learningSituation, setLearningSituation] = useState({});
const [selectedModules, setSelectedModules] = useState([]);
const [availableModules, setAvailableModules] = useState([]);
const [loading, setLoading] = useState(true);
// ... many more state variables

// Complex Functions (20+ functions)
- fetchCompetenceDetailsForModule() // 47 lines
- handleDrop() // 80 lines  
- fetchInitialData() // 130 lines
- handleSave() // 100 lines
```

**Issues Identified**:
- Single component handles too many responsibilities
- Complex state management with interdependent states
- Large useEffect hooks with complex dependencies
- Mixing UI logic with business logic
- Difficult to test individual features

**Proposed Refactoring**:
```
LearningSituationEditor/
├── index.js                     # Main coordinator component
├── hooks/
│   ├── useLearingSituation.js   # Main form state (150 lines)
│   ├── useModuleLibrary.js      # Module library state (200 lines)
│   ├── useCompetenceDetails.js  # Competence fetching (100 lines)
│   └── useDragDrop.js           # Drag and drop logic (150 lines)
├── components/
│   ├── BasicInfoForm.js         # Title, description, year, subject (100 lines)
│   ├── ModuleLibrary.js         # Side panel with available modules (200 lines)
│   ├── SelectedModules.js       # Grid of selected modules (150 lines)
│   ├── ModuleCard.js            # Individual module display (80 lines)
│   └── CompetenceDisplay.js     # Competence and criteria badges (50 lines)
└── utils/
    ├── dateCalculations.js      # Date range utilities
    └── moduleHelpers.js         # Module processing utilities
```

#### 2. ModuleCreationPage.js (865 lines)

**Purpose**: Create and edit educational modules with rich content and competence mapping.

**Current Structure**:
```javascript
// Complex Form State
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [selectedCompetences, setSelectedCompetences] = useState([]);
const [selectedCriteria, setSelectedCriteria] = useState({});
const [files, setFiles] = useState([]);
// ... more form fields

// Heavy Functions
- fetchCompetenceData() // 80 lines
- handleSave() // 120 lines
- toggleEvaluationCriteria() // Complex state updates
- Quill editor management // 50+ lines
```

**Issues Identified**:
- Monolithic form component
- Complex competence/criteria selection logic
- File upload mixed with form logic
- Quill editor initialization scattered
- Difficult to reuse form sections

**Proposed Refactoring**:
```
ModuleCreation/
├── index.js                     # Main form coordinator
├── hooks/
│   ├── useModuleForm.js         # Form state management
│   ├── useCompetenceSelection.js # Competence logic
│   ├── useFileUpload.js         # File operations
│   └── useQuillEditor.js        # Editor management
├── components/
│   ├── BasicInfoSection.js     # Title, description, session length
│   ├── CompetenceSelector.js   # Competence selection UI
│   ├── CriteriaSelector.js     # Evaluation criteria UI
│   ├── FileUploadSection.js    # File management UI
│   ├── QuillEditor.js          # Rich text editor wrapper
│   └── FormActions.js          # Save/cancel buttons
└── validation/
    ├── moduleSchema.js         # Form validation rules
    └── competenceValidation.js # Competence validation
```

#### 3. SubjectLearningDragDrop.js (950 lines)

**Purpose**: Planning interface with drag-and-drop functionality for learning situations.

**Current Structure**:
```javascript
// Planning State
const [subject, setSubject] = useState(null);
const [learningSituations, setLearningSituations] = useState([]);
const [plannedSituations, setPlannedSituations] = useState([]);
const [planningUnits, setPlanningUnits] = useState([]);

// Complex Functions
- handleDrop() // 50 lines with date calculations
- handleDateChange() // 80 lines
- calculateDates() // Complex date logic
- fetchData() // 100 lines loading multiple data sources
```

**Issues Identified**:
- Complex drag-and-drop logic mixed with UI
- Date calculation logic scattered
- Multiple data fetching patterns
- Modal management mixed with main component
- Difficult to test drag-and-drop behavior

**Proposed Refactoring**:
```
SubjectPlanning/
├── index.js                     # Main planning view
├── hooks/
│   ├── usePlanningData.js       # Data fetching and state
│   ├── useDragDropPlanning.js   # Drag-drop behavior
│   ├── useDateCalculations.js   # Date range logic
│   └── usePlanningUnits.js      # Unit management
├── components/
│   ├── PlanningGrid.js          # Main planning grid
│   ├── LearingSituationCard.js  # Draggable cards
│   ├── PlanningUnit.js          # Drop targets
│   ├── DateRangeInput.js        # Date editing
│   └── PlanningHeader.js        # Controls and filters
└── utils/
    ├── dateUtils.js             # Date calculations
    ├── dragDropUtils.js         # Drag-drop utilities
    └── planningValidation.js    # Planning rules
```

#### 4. Content.js (762 lines)

**Purpose**: Content overview and management with filtering and CRUD operations.

**Current Structure**:
```javascript
// Multiple Filter States
const [selectedYear, setSelectedYear] = useState('');
const [selectedSubject, setSelectedSubject] = useState('');
const [moduleStatusFilter, setModuleStatusFilter] = useState('all');

// Modal Management
const [showLearningSituationModal, setShowLearningSituationModal] = useState(false);
const [showModuleModal, setShowModuleModal] = useState(false);
const [editingLearningSituation, setEditingLearningSituation] = useState(null);

// CRUD Operations
- handleLearningSituationSubmit() // 80 lines
- handleModuleSubmit() // 90 lines
- Multiple delete handlers
```

**Issues Identified**:
- Filter logic mixed with CRUD operations
- Multiple modal states in single component
- Repeated CRUD patterns
- Complex data transformation for filtering
- No separation between data and UI concerns

**Proposed Refactoring**:
```
ContentManagement/
├── index.js                     # Main content view
├── hooks/
│   ├── useContentFilters.js     # Filter state and logic
│   ├── useContentData.js        # Data fetching
│   ├── useModalManagement.js    # Modal state
│   └── useCRUDOperations.js     # CRUD operations
├── components/
│   ├── ContentFilters.js        # Filter UI
│   ├── LearingSituationsList.js # Learning situations grid
│   ├── ModulesList.js           # Modules grid
│   ├── ContentCard.js           # Reusable content card
│   └── ActionButtons.js         # CRUD action buttons
└── modals/
    ├── LearningSituationModal.js # Learning situation CRUD
    ├── ModuleModal.js           # Module CRUD
    └── ConfirmDeleteModal.js    # Delete confirmation
```

## 🔧 Common Patterns & Anti-Patterns

### ❌ Current Anti-Patterns

1. **God Components**: Single components handling too many responsibilities
2. **Prop Drilling**: Passing data through multiple component layers
3. **Mixed Concerns**: UI logic mixed with business logic
4. **Repeated Code**: Similar CRUD patterns in multiple components
5. **Complex State**: Too many useState hooks in single components

### ✅ Recommended Patterns

1. **Single Responsibility**: Each component has one clear purpose
2. **Custom Hooks**: Extract and reuse business logic
3. **Compound Components**: Group related UI components
4. **Service Layer**: Separate API logic from components
5. **State Machines**: For complex state transitions

## 🚀 Optimization Strategies

### 1. Performance Optimizations

#### React.memo Implementation
```javascript
// For expensive components
const ModuleCard = React.memo(({ module, onEdit, onDelete }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.module.id === nextProps.module.id &&
         prevProps.module.updatedAt === nextProps.module.updatedAt;
});
```

#### useMemo for Expensive Calculations
```javascript
const useFilteredModules = (modules, filters) => {
  return useMemo(() => {
    return modules.filter(module => {
      // Complex filtering logic
    });
  }, [modules, filters]);
};
```

#### useCallback for Event Handlers
```javascript
const useModuleActions = () => {
  const handleEdit = useCallback((moduleId) => {
    // Edit logic
  }, []);
  
  const handleDelete = useCallback((moduleId) => {
    // Delete logic
  }, []);
  
  return { handleEdit, handleDelete };
};
```

### 2. Code Splitting Strategies

```javascript
// Lazy load heavy components
const LearningSituationEditor = lazy(() => 
  import('./pages/LearningSituationEditor')
);

const ModuleCreationPage = lazy(() => 
  import('./components/ModuleCreationPage')
);

// Route-based splitting
<Route path="/learning-situation/new" element={
  <Suspense fallback={<LoadingSpinner />}>
    <LearningSituationEditor />
  </Suspense>
} />
```

### 3. State Management Optimization

#### Custom Hooks for Complex State
```javascript
// Instead of multiple useState hooks
const useLearingSituationForm = (initialData) => {
  const [state, dispatch] = useReducer(learningSituationReducer, {
    basicInfo: initialData?.basicInfo || {},
    selectedModules: initialData?.modules || [],
    competenceDetails: {},
    loading: false,
    error: null
  });
  
  const actions = useMemo(() => ({
    updateBasicInfo: (info) => dispatch({ type: 'UPDATE_BASIC_INFO', payload: info }),
    addModule: (module) => dispatch({ type: 'ADD_MODULE', payload: module }),
    removeModule: (moduleId) => dispatch({ type: 'REMOVE_MODULE', payload: moduleId }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error })
  }), []);
  
  return [state, actions];
};
```

## 🔄 Migration Strategy

### Phase 1: Extract Common Components (Week 1)
- Create reusable Button, Card, Modal components
- Extract LoadingSpinner, ErrorBoundary
- Standardize form input components

### Phase 2: Custom Hooks (Week 2)
- Extract API logic into custom hooks
- Create useModal, useFilters, usePagination
- Move business logic out of components

### Phase 3: Component Splitting (Week 3-4)
- Break down LearningSituationEditor
- Refactor ModuleCreationPage
- Split Content.js into smaller components

### Phase 4: Service Layer (Week 5)
- Create API service layer
- Add error handling and retry logic
- Implement caching strategies

### Phase 5: Testing & Polish (Week 6)
- Add unit tests for new components
- Integration tests for user flows
- Performance testing and optimization

## 📋 Refactoring Checklist

### Before Refactoring
- [ ] Create comprehensive tests for existing functionality
- [ ] Document current behavior and edge cases
- [ ] Identify all data dependencies
- [ ] Map out user flows that will be affected

### During Refactoring
- [ ] Maintain backward compatibility
- [ ] Test each extracted component independently
- [ ] Verify no functionality is lost
- [ ] Check performance impact

### After Refactoring
- [ ] Update documentation
- [ ] Add tests for new components
- [ ] Verify accessibility standards
- [ ] Performance benchmarking

This analysis provides a detailed roadmap for transforming the Sofia codebase from its current monolithic structure to a more maintainable, testable, and performant architecture. 