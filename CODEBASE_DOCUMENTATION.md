# Sofia Educational Management System - Codebase Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend Structure](#frontend-structure)
3. [Backend Structure](#backend-structure)
4. [Core Components](#core-components)
5. [Data Flow & State Management](#data-flow--state-management)
6. [API Integration](#api-integration)
7. [Optimization Opportunities](#optimization-opportunities)
8. [Modularization Recommendations](#modularization-recommendations)

## 🏗️ Architecture Overview

Sofia is a full-stack educational management system built with:
- **Frontend**: React.js with functional components and hooks
- **Backend**: Django REST Framework
- **Database**: PostgreSQL (implied from Django usage)
- **Authentication**: Token-based authentication
- **UI Pattern**: Component-based with reusable UI elements

### Project Structure
```
sofia/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── contexts/      # React contexts for state
│   │   ├── services/      # API service layers
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── backend/               # Django application
│   ├── apps/             # Django apps
│   └── sofia_project/    # Project configuration
└── node_modules/         # Dependencies
```

## 🎨 Frontend Structure

### Core Architecture Patterns
- **Component-Based**: Modular, reusable React components
- **Hook-Based State**: Uses useState, useEffect, useContext
- **Context API**: Global state management for authentication
- **Routing**: React Router for navigation
- **CSS Modules**: Component-specific styling

### Key Directories

#### `/src/components/`
Contains reusable UI components and business logic components:

**Layout Components:**
- `Layout.js` - Main application wrapper
- `Header.js` - Top navigation bar
- `Sidebar.js` - Side navigation panel

**Business Components:**
- `ModuleCreationPage.js` - Complex module creation form (865 lines)
- `LearningSituationModal.js` - Modal for learning situation management
- `ModuleModal.js` - Modal for module management

**UI Components:**
- `ConfirmDialog.js` - Reusable confirmation dialogs
- `ProtectedRoute.js` - Authentication wrapper

#### `/src/pages/`
Page-level components representing different views:

**Main Views:**
- `Dashboard.js` - Home dashboard with overview
- `Content.js` - Content management interface (762 lines)
- `Planner.js` - Planning and scheduling interface
- `Account.js` - User account management
- `Login.js` - Authentication page

**Complex Views:**
- `LearningSituationEditor.js` - Comprehensive editor (1095 lines)
- `SubjectLearningDragDrop.js` - Drag-and-drop planning interface (950 lines)

#### `/src/contexts/`
Global state management:
- `AuthContext.js` - Authentication state and user information

### Component Complexity Analysis

#### High Complexity Components (>500 lines)
1. **LearningSituationEditor.js** (1095 lines)
   - Purpose: Create/edit learning situations with modules
   - Features: Drag-drop, module library, competence management
   - Optimization needed: Break into smaller components

2. **ModuleCreationPage.js** (865 lines)
   - Purpose: Create/edit educational modules
   - Features: Rich text editing, competence selection, file upload
   - Optimization needed: Extract form sections

3. **SubjectLearningDragDrop.js** (950 lines)
   - Purpose: Plan learning situations with drag-drop interface
   - Features: Calendar planning, unit management
   - Optimization needed: Separate drag-drop logic

4. **Content.js** (762 lines)
   - Purpose: Content overview and management
   - Features: Filtering, CRUD operations, modal management
   - Optimization needed: Extract filter and modal logic

## 🔧 Backend Structure

### Django Architecture
```
backend/
├── apps/                  # Django applications
│   ├── core/             # Core business logic
│   ├── auth/             # Authentication
│   └── api/              # API endpoints
├── sofia_project/        # Project settings
└── manage.py            # Django management
```

### API Patterns
- RESTful API endpoints
- Token-based authentication
- Bulk operations for planning units
- File upload capabilities

## 🧩 Core Components Analysis

### 1. Authentication System
**Files:** `AuthContext.js`, `ProtectedRoute.js`, `Login.js`
- Token-based authentication
- Context API for global auth state
- Protected route wrappers

### 2. Module Management System
**Files:** `ModuleCreationPage.js`, `ModuleModal.js`
- Rich text editing with Quill.js
- Competence and criteria selection
- File attachment system
- Create/Edit modes

### 3. Learning Situation System
**Files:** `LearningSituationEditor.js`, `LearningSituationModal.js`
- Module drag-and-drop interface
- Competence detail fetching
- Planning unit integration
- Library/selection management

### 4. Planning System
**Files:** `SubjectLearningDragDrop.js`, `Planner.js`
- Calendar-based planning
- Drag-and-drop unit assignment
- Date range calculations
- Bulk update operations

### 5. Content Management
**Files:** `Content.js`
- Unified view of learning situations and modules
- Advanced filtering system
- Status indicators (linked/unlinked)
- CRUD operations

## 🔄 Data Flow & State Management

### State Management Patterns
1. **Global State**: AuthContext for user/authentication
2. **Local State**: useState for component-specific data
3. **API State**: Direct API calls with loading/error states
4. **Form State**: Complex form management in large components

### Data Flow
```
User Action → Component → API Service → Backend → Database
                ↓
          State Update → UI Re-render
```

### Critical Data Flows
1. **Authentication**: Login → Token Storage → Context Update
2. **Module Creation**: Form → Validation → API → Refresh
3. **Drag-Drop Planning**: Drag → Drop → Date Calculation → Bulk Update
4. **Competence Loading**: Module Selection → API Fetch → Detail Display

## 🌐 API Integration

### API Patterns Used
- Axios for HTTP requests
- Token authentication headers
- Error handling with try-catch
- Loading states for UX
- Bulk operations for efficiency

### Key API Endpoints
- `/api/auth/dashboard/` - User dashboard data
- `/api/core/modules/` - Module CRUD
- `/api/core/learning-situations/` - Learning situation CRUD
- `/api/core/planning-units/` - Planning operations
- `/api/core/specific-competences/` - Competence data

## 🚀 Optimization Opportunities

### 1. Component Size Reduction
**Priority: High**
- `LearningSituationEditor.js`: Break into 5-7 smaller components
- `ModuleCreationPage.js`: Extract form sections and modals
- `SubjectLearningDragDrop.js`: Separate drag-drop logic

### 2. State Management Optimization
**Priority: Medium**
- Implement React Query/SWR for API state management
- Reduce redundant API calls
- Add caching for competence data

### 3. Performance Improvements
**Priority: Medium**
- Lazy loading for large components
- Memoization for expensive calculations
- Virtual scrolling for large lists

### 4. Code Duplication Reduction
**Priority: High**
- Extract common form components
- Standardize API call patterns
- Create reusable hooks for common operations

## 📦 Modularization Recommendations

### 1. Component Extraction Strategy

#### LearningSituationEditor.js → Multiple Components
```
LearningSituationEditor/
├── index.js                    # Main component
├── components/
│   ├── FormSection.js         # Basic info form
│   ├── ModuleLibrary.js       # Module selection panel
│   ├── SelectedModules.js     # Selected modules display
│   ├── ModuleCard.js          # Individual module card
│   └── CompetenceDisplay.js   # Competence/criteria display
└── hooks/
    ├── useModuleLibrary.js    # Library state management
    ├── useCompetenceDetails.js # Competence fetching
    └── useLearingSituation.js # Main form logic
```

#### ModuleCreationPage.js → Modular Structure
```
ModuleCreation/
├── index.js                   # Main component
├── components/
│   ├── BasicInfoForm.js       # Title, description
│   ├── CompetenceSelector.js  # Competence selection
│   ├── CriteriaSelector.js    # Evaluation criteria
│   ├── FileUploader.js        # File management
│   └── QuillEditor.js         # Rich text editor
└── hooks/
    ├── useModuleForm.js       # Form state management
    ├── useCompetenceData.js   # Competence loading
    └── useFileUpload.js       # File operations
```

### 2. Custom Hooks Strategy

#### Recommended Custom Hooks
```javascript
// API Management
useApi(endpoint, options) // Generic API hook
useAuth() // Authentication operations
useDashboard() // Dashboard data

// Business Logic
useModuleManagement() // Module CRUD operations
useLearingSituationManagement() // Learning situation operations
usePlanningUnits() // Planning operations

// UI State
useModal(initialState) // Modal state management
useFilter(initialFilters) // Filter state management
useDragDrop() // Drag and drop logic

// Data Processing
useCompetenceDetails() // Competence data processing
useDateCalculations() // Date range calculations
useFormValidation(schema) // Form validation
```

### 3. Service Layer Architecture

#### Recommended Service Structure
```
services/
├── api/
│   ├── auth.js              # Authentication API
│   ├── modules.js           # Module operations
│   ├── learningSituations.js # Learning situation operations
│   ├── planning.js          # Planning operations
│   └── competences.js       # Competence operations
├── utils/
│   ├── dateUtils.js         # Date calculations
│   ├── validation.js        # Form validation
│   └── formatting.js        # Data formatting
└── constants/
    ├── apiEndpoints.js      # API URLs
    ├── formSchemas.js       # Validation schemas
    └── uiConstants.js       # UI constants
```

### 4. Component Library Development

#### Reusable Components to Extract
```
components/
├── ui/
│   ├── Button/              # Standardized buttons
│   ├── Card/                # Content cards
│   ├── Modal/               # Modal dialogs
│   ├── Form/                # Form components
│   └── Loading/             # Loading states
├── business/
│   ├── ModuleCard/          # Module display
│   ├── CompetenceSelector/  # Competence selection
│   ├── DateRangePicker/     # Date selection
│   └── FileUploader/        # File operations
└── layout/
    ├── PageLayout/          # Page wrapper
    ├── ContentLayout/       # Content wrapper
    └── FormLayout/          # Form wrapper
```

## 🎯 Implementation Priority

### Phase 1: Critical Refactoring (Weeks 1-2)
1. Extract reusable UI components (Button, Card, Modal)
2. Create custom hooks for API management
3. Break down LearningSituationEditor into 3-4 components

### Phase 2: Service Layer (Weeks 3-4)
1. Implement service layer for API calls
2. Add error handling and loading states
3. Create utility functions for common operations

### Phase 3: Advanced Features (Weeks 5-6)
1. Add React Query for state management
2. Implement lazy loading
3. Add comprehensive error boundaries

### Phase 4: Testing & Documentation (Week 7)
1. Add unit tests for components
2. Add integration tests for user flows
3. Update component documentation

## 📝 Code Standards & Patterns

### Naming Conventions
- Components: PascalCase (`ModuleCard.js`)
- Hooks: camelCase with 'use' prefix (`useModuleData`)
- Services: camelCase (`apiService.js`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

### File Organization
- One component per file
- Co-locate styles with components
- Group related functionality
- Separate business logic from UI logic

### Best Practices Applied
- Functional components with hooks
- PropTypes for type checking
- Error boundaries for error handling
- Accessibility considerations
- Responsive design patterns

This documentation provides a comprehensive roadmap for understanding, optimizing, and modularizing the Sofia codebase. The recommendations focus on maintainability, performance, and developer experience while preserving the existing functionality. 