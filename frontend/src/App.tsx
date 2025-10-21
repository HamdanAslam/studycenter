import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Login } from '@/pages/Login'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { Students } from '@/pages/admin/Students'
import Teachers from '@/pages/admin/Teachers'
import Batches from '@/pages/admin/Batches'
import Attendance from '@/pages/admin/Attendance'
import AdminMonthlyAttendance from '@/pages/admin/MonthlyAttendance'
import Settings from '@/pages/admin/Settings'
import TeacherSettings from '@/pages/teacher/Settings'
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import TakeAttendance from '@/pages/teacher/Attendance'
import AttendanceHistory from '@/pages/teacher/AttendanceHistory'
import MonthlyAttendance from '@/pages/teacher/MonthlyAttendance'
import TeacherBatches from '@/pages/teacher/Batches'
import TeacherStudents from '@/pages/teacher/Students'
import { ProtectedRoute } from '@/components/Layout/ProtectedRoute'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import NotFound from '@/pages/NotFound'
import StudentDetails from '@/pages/admin/StudentDetails'
import StudentsInBatch from '@/pages/admin/StudentsInBatch'

const queryClient = new QueryClient()

const AppRoutes = () => {
	const { user } = useAuth()

	return (
		<Routes>
			<Route
				path='/login'
				element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace /> : <Login />}
			/>

			{/* Admin Routes */}
			<Route
				path='/admin/*'
				element={
					<ProtectedRoute requiredRole='admin'>
						<DashboardLayout>
							<Routes>
								<Route path='/' element={<AdminDashboard />} />
								<Route path='/students' element={<Students />} />
								<Route path='/students/:id' element={<StudentDetails />} />
								<Route path='/teachers' element={<Teachers />} />
								<Route path='/batches' element={<Batches />} />
								<Route path='/batches/:batchId/students' element={<StudentsInBatch />} />
								<Route path='/attendance' element={<Attendance />} />
								<Route path='/attendance-monthly' element={<AdminMonthlyAttendance />} />
								<Route path='/settings' element={<Settings />} />
							</Routes>
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>

			{/* Teacher Routes */}
			<Route
				path='/teacher/*'
				element={
					<ProtectedRoute requiredRole='teacher'>
						<DashboardLayout>
							<Routes>
								<Route path='/' element={<TeacherDashboard />} />
								<Route path='/classes' element={<TeacherBatches />} />
								<Route path='/attendance' element={<TakeAttendance />} />
								<Route path='/attendance-monthly' element={<MonthlyAttendance />} />
								<Route path='/attendance-history' element={<AttendanceHistory />} />
								<Route path='/students' element={<TeacherStudents />} />
								<Route path='/settings' element={<TeacherSettings />} />
							</Routes>
						</DashboardLayout>
					</ProtectedRoute>
				}
			/>

			<Route
				path='/'
				element={
					user ? (
						<Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace />
					) : (
						<Navigate to='/login' replace />
					)
				}
			/>

			{/* Catch-all 404 route */}
			<Route path='*' element={<NotFound />} />
		</Routes>
	)
}

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<AppRoutes />
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
)

export default App
