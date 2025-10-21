import { useLocation, Navigate } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/Layout/Navbar'
import { Sidebar } from '@/components/Layout/Sidebar'

const NotFound = () => {
	const location = useLocation()
	const { user, loading } = useAuth()
	const [sidebarOpen, setSidebarOpen] = useState(false)

	useEffect(() => {
		console.error('404 Error: User attempted to access non-existent route:', location.pathname)
	}, [location.pathname])

	// While auth is loading, don't flash unauthenticated state
	if (loading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-background p-4'>
				<div className='text-center w-full max-w-xs sm:max-w-md mx-auto bg-card border border-border rounded-xl shadow-md p-6'>
					{/* ThemeToggle removed */}
					<p className='text-lg text-muted-foreground'>Loading...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		// Not logged in: redirect to login page
		return <Navigate to='/login' replace state={{ from: location }} />
	}

	// Show navbar/sidebar if logged in
	return (
		<div className='min-h-screen bg-background'>
			<Navbar onMenuClick={() => setSidebarOpen(true)} />
			<div className='flex'>
				{/* Overlay for mobile drawer */}
				{sidebarOpen && (
					<div className='fixed inset-0 z-40 bg-popover/80 md:hidden' onClick={() => setSidebarOpen(false)} />
				)}
				<aside
					className={
						'fixed z-50 inset-y-0 left-0 w-64 bg-card border-r transform transition-transform duration-200 md:static md:translate-x-0 ' +
						(sidebarOpen ? 'translate-x-0' : '-translate-x-full') +
						' md:block'
					}
					style={{ height: '100vh' }}
				>
					<Sidebar onClose={() => setSidebarOpen(false)} />
				</aside>
				<main className='flex-1 flex flex-col items-center justify-center p-4 md:p-6 ml-0 md:ml-0'>
					<div className='text-center w-full max-w-xs sm:max-w-md mx-auto bg-card border border-border rounded-xl shadow-md p-6'>
						{/* ThemeToggle removed */}
						<h1 className='mb-4 text-4xl font-bold text-foreground'>404</h1>
						<p className='mb-4 text-xl text-muted-foreground'>Oops! Page not found</p>
						<a
							href={user.role === 'admin' ? '/admin' : '/teacher'}
							className='text-primary underline hover:text-primary/80 transition-colors'
						>
							Return to Dashboard
						</a>
					</div>
				</main>
			</div>
		</div>
	)
}

export default NotFound
