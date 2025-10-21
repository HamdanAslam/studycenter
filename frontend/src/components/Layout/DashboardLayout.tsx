import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useState } from 'react'

interface DashboardLayoutProps {
	children: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	return (
		<div className='min-h-screen bg-background'>
			<Navbar onMenuClick={() => setSidebarOpen(true)} />
			<div className='flex'>
				{/* Overlay for mobile drawer */}
				{sidebarOpen && (
					<div className='fixed inset-0 z-40 bg-popover/80 md:hidden' onClick={() => setSidebarOpen(false)} />
				)}
				{/* Sidebar: always fixed on desktop, slides in/out on mobile */}
				<aside
					className={
						'fixed left-0 w-64 bg-card border-r z-50 transform transition-transform duration-200 ' +
						(sidebarOpen ? 'translate-x-0' : '-translate-x-full') +
						' md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)] md:inset-y-auto md:block top-0 h-full'
					}
					style={{}}
				>
					<Sidebar onClose={() => setSidebarOpen(false)} />
				</aside>
				{/* Main content: add left margin on desktop to avoid overlap */}
				<main className='flex-1 p-4 md:p-6 ml-0 md:ml-64'>{children}</main>
			</div>
		</div>
	)
}
