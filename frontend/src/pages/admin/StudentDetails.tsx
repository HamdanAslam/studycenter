import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Student, Batch } from '@/types'
import type { StudentAttendanceStats } from '@/types'

export default function StudentDetails() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [student, setStudent] = useState<Student | null>(null)
	const [batches, setBatches] = useState<Batch[]>([])
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		class: '',
		batch_id: '',
		roll_number: '',
	})
	const [allStudents, setAllStudents] = useState<Student[]>([])
	const [rollError, setRollError] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [attendanceStats, setAttendanceStats] = useState<StudentAttendanceStats | null>(null)
	const token = localStorage.getItem('token')

	useEffect(() => {
		if (!id) return
		setLoading(true)
		Promise.all([
			fetch(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
			fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
			fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
			fetch(`/api/students/${id}/attendance`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
		])
			.then(([studentData, batchesData, allStudentsData, attendanceData]) => {
				setStudent(studentData)
				setBatches(batchesData)
				setAllStudents(allStudentsData)
				setAttendanceStats(attendanceData)
				setForm({
					name: studentData.name || '',
					email: studentData.email || '',
					phone: studentData.phone || '',
					class: String(studentData.class || ''),
					batch_id: studentData.batch_id || '',
					roll_number: studentData.roll_number ? String(studentData.roll_number) : '',
				})
			})
			.catch(() => setError('Failed to load student'))
			.finally(() => setLoading(false))
	}, [id])

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setError('')
		setRollError('')
		// Validate roll number uniqueness in class
		const rollNum = Number(form.roll_number)
		if (!rollNum || rollNum < 1) {
			setRollError('Roll number must be a positive integer')
			setSaving(false)
			return
		}
		const duplicate = allStudents.find(s => s.class === Number(form.class) && s.roll_number === rollNum && s.id !== id)
		if (duplicate) {
			setRollError('Roll number must be unique within the class')
			setSaving(false)
			return
		}
		try {
			const res = await fetch(`/api/students/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: form.name,
					email: form.email,
					phone: form.phone,
					class: Number(form.class),
					batch_id: form.batch_id || null,
					roll_number: rollNum,
				}),
			})
			if (!res.ok) throw new Error('Failed to update student')
			const updated = await res.json()
			setStudent(updated)
			setForm({
				name: updated.name || '',
				email: updated.email || '',
				phone: updated.phone || '',
				class: String(updated.class || ''),
				batch_id: updated.batch_id || '',
				roll_number: updated.roll_number ? String(updated.roll_number) : '',
			})
		} catch {
			setError('Failed to update student')
		} finally {
			setSaving(false)
		}
	}

	if (loading) return <div className='p-8 text-center'>Loading...</div>
	if (!student) return <div className='p-8 text-center text-red-500'>Student not found</div>

	return (
		<div className='max-w-5xl mx-auto p-4'>
			<div className='flex flex-col gap-8 md:flex-row md:items-start'>
				<div className='flex-1 min-w-0'>
					<Card>
						<CardHeader>
							<CardTitle>Edit Student</CardTitle>
							<CardDescription>
								Update student details and save changes. You can also delete this student.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSave} className='space-y-4'>
								<div>
									<Label htmlFor='name'>Name</Label>
									<Input
										id='name'
										value={form.name}
										onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
									/>
								</div>
								<div>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										value={form.email}
										onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
									/>
								</div>
								<div>
									<Label htmlFor='phone'>Phone</Label>
									<Input
										id='phone'
										value={form.phone}
										onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
									/>
								</div>
								<div>
									<Label htmlFor='class'>Class</Label>
									<Select value={form.class} onValueChange={val => setForm(f => ({ ...f, class: val }))}>
										<SelectTrigger>
											<SelectValue placeholder='Select class' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='8'>Class 8</SelectItem>
											<SelectItem value='9'>Class 9</SelectItem>
											<SelectItem value='10'>Class 10</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='batch'>Batch</Label>
									<Select value={form.batch_id} onValueChange={val => setForm(f => ({ ...f, batch_id: val }))}>
										<SelectTrigger>
											<SelectValue placeholder='Select batch' />
										</SelectTrigger>
										<SelectContent>
											{batches.map(batch => (
												<SelectItem key={batch.id} value={batch.id}>
													{batch.name} (Class {batch.class})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='roll_number'>Roll Number</Label>
									<Input
										id='roll_number'
										type='number'
										value={form.roll_number}
										onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))}
										min={1}
										step={1}
									/>
									{rollError && (
										<div className='flex items-center gap-3 mt-3 mb-2 px-4 py-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-4 w-4 shrink-0'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
												strokeWidth={2}
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.658-1.14 1.105-2.045L13.105 4.945c-.527-.905-1.684-.905-2.211 0L3.977 16.955c-.553.905.051 2.045 1.105 2.045z'
												/>
											</svg>
											<span>{rollError}</span>
										</div>
									)}
								</div>
								{error && <div className='text-red-500 text-sm'>{error}</div>}
								<div className='flex gap-2 mt-4'>
									<Button type='submit' disabled={saving}>
										{saving ? 'Saving...' : 'Save Changes'}
									</Button>
									<Button type='button' variant='secondary' onClick={() => navigate(-1)}>
										Cancel
									</Button>
									<Button
										type='button'
										variant='destructive'
										onClick={async () => {
											if (!window.confirm('Are you sure you want to delete this student?')) return
											try {
												const res = await fetch(`/api/students/${id}`, {
													method: 'DELETE',
													headers: { Authorization: `Bearer ${token}` },
												})
												if (!res.ok) throw new Error('Failed to delete')
												navigate('/admin/students')
											} catch {
												setError('Failed to delete student')
											}
										}}
									>
										Delete Student
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
				{attendanceStats && (
					<div className='flex-1 min-w-0'>
						<Card>
							<CardHeader>
								<CardTitle>Attendance Summary</CardTitle>
								<CardDescription>
									<span className='font-semibold'>Present:</span> {attendanceStats.present} /{' '}
									{attendanceStats.total} &nbsp;|
									<span className='font-semibold ml-2'>Absent:</span> {attendanceStats.absent} &nbsp;|
									<span className='font-semibold ml-2'>Late:</span> {attendanceStats.late} &nbsp;|
									<span className='font-semibold ml-2'>Percentage:</span> {attendanceStats.percentage}%
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='overflow-x-auto'>
									<table className='min-w-full text-sm border'>
										<thead>
											<tr className='bg-secondary'>
												<th className='px-2 py-1 border'>Date</th>
												<th className='px-2 py-1 border'>Status</th>
											</tr>
										</thead>
										<tbody>
											{attendanceStats.history.map(rec => (
												<tr key={rec.id}>
													<td className='px-2 py-1 border'>
														{new Date(rec.date).toLocaleDateString()}
													</td>
													<td className='px-2 py-1 border'>
														{rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	)
}
