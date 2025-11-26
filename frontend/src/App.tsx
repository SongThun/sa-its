import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseForm from './pages/instructor/CourseForm';
import InstructorRegister from './pages/instructor/InstructorRegister';
import InstructorLogin from './pages/instructor/InstructorLogin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/courses" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/course/:courseId/lesson/:lessonId" element={<Lesson />} />

              {/* Instructor Routes */}
              <Route path="/instructor/register" element={<InstructorRegister />} />
              <Route path="/instructor/login" element={<InstructorLogin />} />
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/courses/create" element={<CourseForm />} />
              <Route path="/instructor/courses/:id/edit" element={<CourseForm />} />

              {/* 404 - Catch all unknown routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
