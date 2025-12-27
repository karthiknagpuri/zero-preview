import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BlogProvider } from './BlogContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Admin imports
import AdminLogin from './admin/AdminLogin.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import ProtectedRoute from './admin/ProtectedRoute.jsx'

// Admin sections
import BlogSection from './admin/sections/BlogSection.jsx'
import ResourcesSection from './admin/sections/ResourcesSection.jsx'
import LinksSection from './admin/sections/LinksSection.jsx'
import MapEditorSection from './admin/sections/MapEditorSection.jsx'
import ExperiencesSection from './admin/sections/ExperiencesSection.jsx'
import MessagesSection from './admin/sections/MessagesSection.jsx'
import ContentStudioSection from './admin/sections/ContentStudioSection.jsx'
import GallerySection from './admin/sections/GallerySection.jsx'
import ReadingLogSection from './admin/sections/ReadingLogSection.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BlogProvider>
          <Routes>
            {/* Public route */}
            <Route path="/" element={<App />} />

            {/* Admin login (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="blog" element={<BlogSection />} />
              <Route path="resources" element={<ResourcesSection />} />
              <Route path="links" element={<LinksSection />} />
              <Route path="map" element={<MapEditorSection />} />
              <Route path="experiences" element={<ExperiencesSection />} />
              <Route path="messages" element={<MessagesSection />} />
              <Route path="content" element={<ContentStudioSection />} />
              <Route path="gallery" element={<GallerySection />} />
              <Route path="reading" element={<ReadingLogSection />} />
            </Route>
          </Routes>
        </BlogProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
