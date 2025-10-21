import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export const TeacherDashboard = () => {
	const [stats, setStats] = useState<any>(null)
	const [todaysClasses, setTodaysClasses] = useState<any[]>([])
	const token = localStorage.getItem('token')

	useEffect(() => {
		// Fetch stats (students, attendance, etc.)
		fetch('/api/dashboard', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => res.json())
			.then(data => setStats(data))
			.catch(() => setStats(null))
		// Fetch today's classes (batches)
		fetch('/api/batches', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => res.json())
			.then(batches => {
				// Defensive: ensure batches is an array
				if (Array.isArray(batches)) {
					setTodaysClasses(batches)
				} else {
					setTodaysClasses([])
				}
				// Debug log
				// ...existing code...
			})
			.catch(err => {
				setTodaysClasses([])
				console.error('[TeacherDashboard] Error fetching /api/batches:', err)
			})
	}, [])

	return (
		<div className='space-y-6 px-2 sm:px-4 max-w-6xl mx-auto'>
			<div>
				<h1 className='text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left'>Teacher Dashboard</h1>
				<p className='text-muted-foreground text-center sm:text-left'>Manage your classes and students</p>
			</div>

			<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Students</CardTitle>
						<Users className='h-4 w-4 text-accent' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.studentCount ?? '-'}</div>
						<p className='text-xs text-muted-foreground'>Total students</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Attendance Records</CardTitle>
						<CheckCircle className='h-4 w-4 text-success' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.attendanceCount ?? '-'}</div>
						<p className='text-xs text-muted-foreground'>Total attendance entries</p>
					</CardContent>
				</Card>
				{/* Add more stats as needed */}
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>Today's Schedule</CardTitle>
						<CardDescription>Your classes for today</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{todaysClasses.length === 0 && <div className='text-muted-foreground'>No classes today</div>}
							{todaysClasses.map(classItem => (
								<div key={classItem.id} className='flex items-center justify-between p-3 border rounded-lg'>
									<div className='flex-1'>
										<div className='flex items-center space-x-2'>
											<h4 className='font-medium'>{classItem.subject}</h4>
											<span className='inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary'>
												Class {classItem.class}
											</span>
										</div>
										<p className='text-sm text-muted-foreground'>{classItem.schedule || 'No time set'}</p>
									</div>
									<Button size='sm' asChild>
										<Link to={`/teacher/attendance?batch=${classItem.id}`}>Take Attendance</Link>
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks</CardDescription>
					</CardHeader>
					<CardContent className='space-y-3'>
						<Button asChild className='w-full justify-start'>
							<Link to='/teacher/attendance'>
								<Calendar className='mr-2 h-4 w-4' />
								Take Attendance
							</Link>
						</Button>
						<Button asChild variant='outline' className='w-full justify-start'>
							<Link to='/teacher/classes'>
								<Users className='mr-2 h-4 w-4' />
								View My Classes
							</Link>
						</Button>
						<Button asChild variant='outline' className='w-full justify-start'>
							<Link to='/teacher/students'>
								<CheckCircle className='mr-2 h-4 w-4' />
								View Students
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
