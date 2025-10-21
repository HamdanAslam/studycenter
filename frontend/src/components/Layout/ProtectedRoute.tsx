import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
	children: React.ReactNode
	requiredRole?: 'admin' | 'teacher'
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
	const { user, loading } = useAuth()
	// Debug log
	// ...existing code...

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		)
	}

	if (!user) {
		return <Navigate to='/login' replace />
	}

	// Allow admin to access teacher routes for testing
	if (requiredRole && user.role !== requiredRole) {
		// If admin tries to access teacher routes, allow
		if (requiredRole === 'teacher' && user.role === 'admin') {
			return <>{children}</>
		}
		return <Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace />
	}

	return <>{children}</>
}
