import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Users, UserCheck, Calendar, BookOpen, BarChart3, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
	className?: string
	onClose?: () => void
}

export const Sidebar = ({ className, onClose }: SidebarProps) => {
	const { user } = useAuth()
	const location = useLocation()

	const adminMenuItems = [
		{
			title: 'Dashboard',
			href: '/admin',
			icon: BarChart3,
		},
		{
			title: 'Students',
			href: '/admin/students',
			icon: Users,
		},
		{
			title: 'Teachers',
			href: '/admin/teachers',
			icon: UserCheck,
		},
		{
			title: 'Batches',
			href: '/admin/batches',
			icon: BookOpen,
		},
		{
			title: 'Attendance',
			href: '/admin/attendance',
			icon: Calendar,
		},
		{
			title: 'Settings',
			href: '/admin/settings',
			icon: Settings,
		},
	]

	const teacherMenuItems = [
		{
			title: 'Dashboard',
			href: '/teacher',
			icon: BarChart3,
		},
		{
			title: 'My Classes',
			href: '/teacher/classes',
			icon: BookOpen,
		},
		{
			title: 'Take Attendance',
			href: '/teacher/attendance',
			icon: Calendar,
		},
		{
			title: 'Attendance History',
			href: '/teacher/attendance-history',
			icon: Calendar,
		},
		{
			title: 'Students',
			href: '/teacher/students',
			icon: Users,
		},
		{
			title: 'Settings',
			href: '/teacher/settings',
			icon: Settings,
		},
	]

	const menuItems = user?.role === 'admin' ? adminMenuItems : teacherMenuItems

	return (
		<div className={cn('pb-12 w-64 bg-card border-r h-full flex flex-col', className)}>
			{/* Close button for mobile */}
			<div className='md:hidden flex justify-end p-2'>
				<button
					onClick={onClose}
					className='rounded p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'
					aria-label='Close menu'
				>
					<svg className='h-6 w-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
					</svg>
				</button>
			</div>
			<div className='space-y-4 py-4 flex-1 overflow-y-auto'>
				<div className='px-3 py-2'>
					<div className='space-y-1'>
						{menuItems.map(item => (
							<Link
								key={item.href}
								to={item.href}
								className={cn(
									'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
									location.pathname === item.href
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground'
								)}
								onClick={onClose}
							>
								<item.icon className='mr-2 h-4 w-4' />
								{item.title}
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
