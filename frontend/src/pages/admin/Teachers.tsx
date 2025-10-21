import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'

interface TeacherForm {
	id?: string
	name: string
	email: string
	phone: string
	subjects: string
	password?: string
}

const Teachers: React.FC = () => {
	const [teachers, setTeachers] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [editTeacher, setEditTeacher] = useState<any | null>(null)
	const { register, handleSubmit, reset } = useForm<TeacherForm>()
	const token = localStorage.getItem('token')

	// Fetch teachers
	const fetchTeachers = async () => {
		setLoading(true)
		const res = await fetch('/api/teachers', {
			headers: { Authorization: `Bearer ${token}` },
		})
		const data = await res.json()
		setTeachers(data)
		setLoading(false)
	}

	useEffect(() => {
		fetchTeachers()
	}, [])

	// Add or edit teacher
	const onSubmit = async (values: TeacherForm) => {
		const body = {
			...values,
			subjects: values.subjects.split(',').map(s => s.trim()),
		}
		if (editTeacher) {
			await fetch(`/api/teachers/${editTeacher.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(body),
			})
		} else {
			await fetch('/api/teachers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(body),
			})
		}
		setOpen(false)
		setEditTeacher(null)
		reset()
		fetchTeachers()
	}

	// Delete teacher
	const handleDelete = async (id: string) => {
		if (!window.confirm('Delete this teacher?')) return
		await fetch(`/api/teachers/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		fetchTeachers()
	}

	// Open edit modal
	const handleEdit = (teacher: any) => {
		setEditTeacher(teacher)
		reset({
			id: teacher.id,
			name: teacher.name,
			email: teacher.email,
			phone: teacher.phone,
			subjects: (teacher.subjects || []).join(', '),
		})
		setOpen(true)
	}

	// Open add modal
	const handleAdd = () => {
		setEditTeacher(null)
		reset({ name: '', email: '', phone: '', subjects: '', password: '' })
		setOpen(true)
	}

	return (
		<div className='p-2 sm:p-6 max-w-6xl mx-auto'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
				<h1 className='text-2xl sm:text-3xl font-bold text-center sm:text-left'>Manage Teachers</h1>
				<Button onClick={handleAdd} className='w-full sm:w-auto'>
					Add Teacher
				</Button>
			</div>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Subjects</TableHead>
							<TableHead>Classes</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6}>Loading...</TableCell>
							</TableRow>
						) : teachers.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6}>No teachers found.</TableCell>
							</TableRow>
						) : (
							teachers.map(t => (
								<TableRow key={t.id}>
									<TableCell>{t.name}</TableCell>
									<TableCell>{t.email}</TableCell>
									<TableCell>{t.phone}</TableCell>
									<TableCell>{(t.subjects || []).join(', ')}</TableCell>
									<TableCell>{(t.classes || []).join(', ')}</TableCell>
									<TableCell>
										<Button size='sm' variant='outline' onClick={() => handleEdit(t)}>
											Edit
										</Button>
										<Button
											size='sm'
											variant='destructive'
											onClick={() => handleDelete(t._id || t.id)}
											className='ml-2'
										>
											Delete
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<h2 className='text-xl font-bold mb-2'>{editTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
						<Input placeholder='Name' {...register('name', { required: true })} />
						<Input placeholder='Email' {...register('email')} />
						<Input placeholder='Phone' {...register('phone')} />
						<Input placeholder='Subjects (comma separated)' {...register('subjects')} />
						<Input
							placeholder='Password (for teacher login)'
							type='password'
							{...register('password', { required: !editTeacher })}
						/>
						{/* No classes field */}
						<DialogFooter>
							<Button type='submit' className='w-full sm:w-auto'>
								{editTeacher ? 'Save Changes' : 'Add Teacher'}
							</Button>
							<Button type='button' variant='outline' onClick={() => setOpen(false)} className='w-full sm:w-auto'>
								Cancel
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Teachers
