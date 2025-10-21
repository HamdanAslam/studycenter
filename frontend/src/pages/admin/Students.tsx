import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Student, Subject, Batch } from '@/types'
import { toast } from '@/hooks/use-toast'

export const Students = () => {
	const [searchTerm, setSearchTerm] = useState('')
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

	const [students, setStudents] = useState<Student[]>([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ name: '', email: '', phone: '', class: '', batch_id: '' })
	const [batches, setBatches] = useState<Batch[]>([])
	const [error, setError] = useState('')
	const token = localStorage.getItem('token')

	// Fetch students and batches from backend
	useEffect(() => {
		setLoading(true)
		Promise.all([
			fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
			fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
		])
			.then(([studentsData, batchesData]) => {
				setStudents(studentsData)
				setBatches(batchesData)
			})
			.catch(() => {
				setStudents([])
				setBatches([])
			})
			.finally(() => setLoading(false))
	}, [])

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
					<h1 className='text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left'>Students</h1>
					<p className='text-muted-foreground text-center sm:text-left'>Manage student records</p>
				</div>
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button className='w-full sm:w-auto'>
							<Plus className='mr-2 h-4 w-4' />
							Add Student
						</Button>
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Add New Student</DialogTitle>
							<DialogDescription>Enter student details to add them to the system.</DialogDescription>
						</DialogHeader>
						<form className='space-y-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='name' className='text-right'>
									Name
								</Label>
								<Input
									id='name'
									className='col-span-3'
									value={form.name}
									onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='email' className='text-right'>
									Email
								</Label>
								<Input
									id='email'
									className='col-span-3'
									value={form.email}
									onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='phone' className='text-right'>
									Phone
								</Label>
								<Input
									id='phone'
									className='col-span-3'
									value={form.phone}
									onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='class' className='text-right'>
									Class
								</Label>
								<Select value={form.class} onValueChange={val => setForm(f => ({ ...f, class: val }))}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select class' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='8'>Class 8</SelectItem>
										<SelectItem value='9'>Class 9</SelectItem>
										<SelectItem value='10'>Class 10</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='batch' className='text-right'>
									Batch
								</Label>
								<Select value={form.batch_id} onValueChange={val => setForm(f => ({ ...f, batch_id: val }))}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select batch' />
									</SelectTrigger>
									<SelectContent>
										{batches
											.filter(b => b.id)
											.map(batch => (
												<SelectItem key={batch.id} value={batch.id}>
													{batch.name} (Class {batch.class})
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
							{error && <div className='col-span-4 text-red-500 text-sm'>{error}</div>}
							<DialogFooter>
								<Button type='submit'>Add Student</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Class</TableHead>
							<TableHead>Batch</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
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
								<TableCell colSpan={6}>No students found</TableCell>
							</TableRow>
						) : (
							filteredStudents.map(student => (
								<TableRow key={student.id}>
									<TableCell>{student.name}</TableCell>
									<TableCell>
										<Badge className={getClassColor(student.class)}>{student.class}</Badge>
									</TableCell>
									<TableCell>{student.batch_id}</TableCell>
									<TableCell>{student.email}</TableCell>
									<TableCell>{student.phone}</TableCell>
									<TableCell>
										<Button size='sm' variant='outline' onClick={() => {}}>
											<Edit className='h-4 w-4' />
										</Button>
										<Button size='sm' variant='destructive' onClick={() => {}}>
											<Trash2 className='h-4 w-4' />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
