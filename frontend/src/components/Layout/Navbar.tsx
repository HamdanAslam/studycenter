import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { GraduationCap, User, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
	const { user, logout } = useAuth()

	// Determine profile route based on role
	const profileRoute = user?.role === 'admin' ? '/admin/settings' : '/teacher/settings'

	return (
		<nav className='border-b bg-card sticky top-0 z-[60]'>
			<div className='flex h-16 items-center px-4 md:px-6'>
				{/* Hamburger for mobile */}
				<button
					className='mr-3 flex md:hidden items-center justify-center rounded p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'
					onClick={onMenuClick}
					aria-label='Open menu'
				>
					<svg className='h-6 w-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
					</svg>
				</button>
				<div className='flex items-center space-x-2'>
					<GraduationCap className='h-8 w-8 text-primary' />
					<h1 className='text-xl font-bold text-foreground'>Studycenter</h1>
				</div>
				<div className='ml-auto flex items-center space-x-4'>
					{/* ThemeToggle removed */}
					<span className='text-sm text-muted-foreground'>Welcome, {user?.name}</span>
					<span className='inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary'>
						{user?.role?.toUpperCase()}
					</span>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='sm'>
								<User className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem asChild>
								<a href={profileRoute} className='flex items-center'>
									<User className='mr-2 h-4 w-4' />
									Profile
								</a>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={logout}>
								<LogOut className='mr-2 h-4 w-4' />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</nav>
	)
}
