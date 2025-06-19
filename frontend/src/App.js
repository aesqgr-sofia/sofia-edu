import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure you have this component
import Login from './pages/Login';
import SchoolDetail from './pages/SchoolDetail';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Content from './pages/Content';
import Planner from './pages/Planner';
import SubjectLearningDragDrop from './pages/SubjectLearningDragDrop';
import LearningSituationEditor from './pages/LearningSituationEditorRefactored';
import ModuleCreationPage from './components/ModuleCreationPageRefactored';

// PrivateRoute component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="dashboard-page">
      <main className="container">
      
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            <Route 
              path="/schools/:id" 
              element={
                <ProtectedRoute>
                  <SchoolDetail />
                </ProtectedRoute>
              } 
            />
            {/* Protected route for the dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/content" 
              element={
                <PrivateRoute>
                  <Content />
                </PrivateRoute>
              } 
            />    
            <Route 
              path="/planner" 
              element={
                <PrivateRoute>
                  <Planner />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/subject/:subjectId/learning-situations" 
              element={
                <PrivateRoute>
                  <SubjectLearningDragDrop />
                </PrivateRoute>
              } 
            />                      
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            {/* Add the routes for the Learning Situation Editor */}
            <Route path="/learning-situation/new" element={
              <ProtectedRoute>
                <LearningSituationEditor />
              </ProtectedRoute>
            } />
            <Route path="/learning-situation/:situationId" element={
              <ProtectedRoute>
                <LearningSituationEditor />
              </ProtectedRoute>
            } />
            {/* Add the route for the Module Creation Page */}
            <Route path="/subjects/:subjectId/create-module" element={<ModuleCreationPage />} />
            {/* If you need to also support passing the yearId explicitly: */}
            <Route path="/subjects/:subjectId/years/:yearId/create-module" element={<ModuleCreationPage />} />
            {/* Add a new route for module creation */}
            <Route path="/module/new" element={<ModuleCreationPage />} />
            {/* Route for editing an existing module */}
            <Route path="/module/:moduleId/edit" element={<ModuleCreationPage />} />
            {/* Other routes as needed */}
          </Routes>
        </Router>
      </AuthProvider>
      </main>
    </div>
  );
}

export default App;
