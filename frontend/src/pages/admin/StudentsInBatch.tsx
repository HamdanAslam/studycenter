import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Edit, Trash2 } from 'lucide-react'
import { Student } from '@/types'
import { toast } from '@/hooks/use-toast'

const StudentsInBatch: React.FC = () => {
	const { batchId } = useParams()
	const navigate = useNavigate()
	const [students, setStudents] = useState<Student[]>([])
	const [loading, setLoading] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const token = localStorage.getItem('token')

	useEffect(() => {
		if (!batchId) return
		setLoading(true)
		fetch(`/api/batches/${batchId}/students`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => res.json())
			.then(data => setStudents(data))
			.catch(() => setStudents([]))
			.finally(() => setLoading(false))
	}, [batchId])

	const filteredStudents = students.filter(
		student =>
			student.id &&
			(student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(student.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
	)

	const getClassColor = (classNum: number) => {
		switch (classNum) {
			case 8:
				return 'bg-accent text-accent-foreground'
			case 9:
				return 'bg-secondary text-secondary-foreground'
			case 10:
				return 'bg-muted text-muted-foreground'
			default:
				return 'bg-popover text-foreground'
		}
	}

	return (
		<div className='space-y-6 p-2 sm:p-4 max-w-6xl mx-auto'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
				<div>
					<h1 className='text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left'>Students in Batch</h1>
					<p className='text-muted-foreground text-center sm:text-left'>View and manage students in this batch</p>
				</div>
				<Button variant='secondary' onClick={() => navigate(-1)}>
					Back
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Student List</CardTitle>
					<CardDescription>Total {students.length} students in this batch</CardDescription>
					<div className='flex items-center space-x-2'>
						<Search className='h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search students...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='max-w-sm'
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Class</TableHead>
								<TableHead>Roll No.</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={6}>Loading...</TableCell>
								</TableRow>
							) : filteredStudents.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6}>No students found in this batch.</TableCell>
								</TableRow>
							) : (
								filteredStudents.map(student => (
									<TableRow key={student.id}>
										<TableCell className='font-medium'>{student.name}</TableCell>
										<TableCell>{student.email}</TableCell>
										<TableCell>{student.phone}</TableCell>
										<TableCell>
											<Badge className={getClassColor(student.class)}>Class {student.class}</Badge>
										</TableCell>
										<TableCell>{student.roll_number}</TableCell>
										<TableCell>
											<div className='flex items-center space-x-2'>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => navigate(`/admin/students/${student.id}`)}
													title='Edit student'
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={async () => {
														if (!window.confirm('Delete this student?')) return
														try {
															const res = await fetch(`/api/students/${student.id}`, {
																method: 'DELETE',
																headers: { Authorization: `Bearer ${token}` },
															})
															if (!res.ok) throw new Error('Failed to delete')
															setStudents(prev => prev.filter(s => s.id !== student.id))
														} catch (e) {
															toast({
																title: 'Failed to delete student',
																description: 'An error occurred while deleting the student.',
																variant: 'destructive',
															})
														}
													}}
													title='Delete student'
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}

export default StudentsInBatch
