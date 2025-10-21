import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, BookOpen, Calendar } from 'lucide-react'

export const AdminDashboard = () => {
	const [stats, setStats] = useState<any>(null)
	const [classDist, setClassDist] = useState<any[]>([])
	const [activity, setActivity] = useState<any[]>([])
	const token = localStorage.getItem('token')

	useEffect(() => {
		fetch('/api/dashboard', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => res.json())
			.then(data => setStats(data))
			.catch(() => setStats(null))
		fetch('/api/students', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => res.json())
			.then(students => {
				// Group by class
				const dist = [8, 9, 10].map(cls => ({
					class: cls,
					count: students.filter((s: any) => s.class === cls).length,
				}))
				setClassDist(dist)
			})
			.catch(() => setClassDist([]))
		// Optionally, fetch activity from a real endpoint
		// setActivity([])
	}, [])

	return (
		<div className='space-y-6 p-2 sm:p-4 max-w-6xl mx-auto'>
			<div>
				<h1 className='text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left'>Admin Dashboard</h1>
				<p className='text-muted-foreground text-center sm:text-left'>Overview of your study center</p>
			</div>

			{/* Stats cards */}
			<div className='grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader>
						<CardTitle>Teachers</CardTitle>
						<CardDescription>Total teachers</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.teacherCount ?? '-'}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Attendance Records</CardTitle>
						<CardDescription>Total attendance entries</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats?.attendanceCount ?? '-'}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Students</CardTitle>
						<CardDescription>Total students</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{classDist.reduce((a, b) => a + b.count, 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Classes</CardTitle>
						<CardDescription>Class groups</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{classDist.length}</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Links and Class Distribution */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-3'>
					<CardHeader>
						<CardTitle>Class Distribution</CardTitle>
						<CardDescription>Students by class</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							{classDist.map(cls => (
								<div key={cls.class} className='flex items-center justify-between'>
									<span>Class {cls.class}</span>
									<span className='font-bold'>{cls.count}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
