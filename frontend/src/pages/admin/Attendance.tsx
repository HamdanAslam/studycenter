import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import type { Student, AttendanceRecord } from '@/types'

function hasName(obj: unknown): obj is { name: string } {
	return !!obj && typeof obj === 'object' && 'name' in obj && typeof (obj as any).name === 'string'
}

const AdminAttendanceHistory: React.FC = () => {
	const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
	const [batches, setBatches] = useState<any[]>([])
	const [students, setStudents] = useState<Student[]>([])
	const [selectedBatch, setSelectedBatch] = useState('')
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [selectedStudent, setSelectedStudent] = useState('all')
	const [selectedStatus, setSelectedStatus] = useState('all')
	const [loading, setLoading] = useState(false)
	const token = localStorage.getItem('token')
	const navigate = useNavigate()

	useEffect(() => {
		fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.json())
			.then(setBatches)
			.catch(() => setBatches([]))
	}, [token])

	useEffect(() => {
		if (!selectedBatch) return
		fetch(`/api/batches/${selectedBatch}`, { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.json())
			.then(batch => {
				const s = batch.students || []
				try {
					setStudents(Array.isArray(s) ? [...s].sort((a, b) => (a?.roll_number || 0) - (b?.roll_number || 0)) : [])
				} catch (e) {
					setStudents(s)
				}
			})
			.catch(() => setStudents([]))
	}, [selectedBatch, token])

	const fetchAttendance = async () => {
		setLoading(true)
		try {
			let url = '/api/attendance'
			const params: string[] = []
			if (selectedBatch) params.push(`batch_id=${selectedBatch}`)
			if (selectedDate) params.push(`date=${selectedDate.toISOString().slice(0, 10)}`)
			if (selectedStudent && selectedStudent !== 'all') params.push(`student_id=${selectedStudent}`)
			if (selectedStatus && selectedStatus !== 'all') params.push(`status=${selectedStatus}`)
			if (params.length) url += '?' + params.join('&')

			const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
			const data = await res.json()
			let attendanceArr: any[] = []
			if (Array.isArray(data)) {
				attendanceArr = data.map(a => ({ ...a, id: a._id || a.id }))
			} else if (data && Array.isArray(data.attendance)) {
				attendanceArr = data.attendance.map(a => ({ ...a, id: a._id || a.id }))
			}
			setAttendance(attendanceArr)
		} catch (e) {
			setAttendance([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (selectedBatch) {
			fetchAttendance()
		} else {
			setAttendance([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedBatch, selectedDate, selectedStudent, selectedStatus])

	const getStatusColor = (status: string) => {
		if (status === 'present') return 'bg-green-500 text-white'
		if (status === 'absent') return 'bg-red-500 text-white'
		if (status === 'late') return 'bg-yellow-500 text-black'
		return 'bg-gray-500 text-white'
	}

	return (
		<div className='max-w-2xl mx-auto px-2 sm:px-0 py-6'>
			<h1 className='text-2xl font-bold mb-6 text-center'>Attendance History (Admin)</h1>

			<div className='bg-white border rounded-lg p-4 mb-8 flex flex-col gap-4 max-w-md mx-auto'>
				<div>
					<label className='block text-sm font-medium mb-1'>Batch</label>
					<Select value={selectedBatch} onValueChange={setSelectedBatch}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select Batch' />
						</SelectTrigger>
						<SelectContent>
							{batches.map((b: any) => (
								<SelectItem key={b.id} value={String(b.id)}>
									{b.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<label className='block text-sm font-medium mb-1'>Student</label>
					<Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!students.length}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='All Students' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Students</SelectItem>
							{students.map(s => (
								<SelectItem key={s.id || s.roll_number} value={s.id}>
									{s.roll_number}. {s.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<label className='block text-sm font-medium mb-1'>Status</label>
					<Select value={selectedStatus} onValueChange={setSelectedStatus}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='All Statuses' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Statuses</SelectItem>
							<SelectItem value='present'>Present</SelectItem>
							<SelectItem value='absent'>Absent</SelectItem>
							<SelectItem value='late'>Late</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='flex flex-col items-center'>
					<label className='block text-sm font-medium mb-1'>Date</label>
					<div className='w-full flex justify-center'>
						<Calendar
							mode='single'
							selected={selectedDate || undefined}
							onSelect={setSelectedDate}
							className='rounded-md border'
						/>
					</div>
				</div>

				<div className='w-full mt-2 flex gap-2'>
					<Button onClick={() => fetchAttendance()} className='flex-1'>
						Refresh
					</Button>
					<Button
						variant='outline'
						className='flex-1'
						onClick={() => {
							if (!selectedBatch) return
							const y = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
							const m = selectedDate ? selectedDate.getMonth() + 1 : new Date().getMonth() + 1
							navigate(`/admin/attendance-monthly?batch_id=${selectedBatch}&year=${y}&month=${m}`)
						}}
					>
						Monthly View
					</Button>
				</div>
			</div>

			<div>
				<h2 className='text-lg font-semibold mb-3 text-center'>Attendance Records</h2>
				{loading ? (
					<div className='text-center py-4'>Loading...</div>
				) : attendance.length === 0 ? (
					<div className='text-center py-4'>No attendance records found.</div>
				) : (
					<ul className='divide-y divide-gray-200 rounded border bg-white'>
						{attendance
							.sort((a, b) => {
								const getRoll = (rec: any) => {
									if (rec && typeof rec === 'object' && rec.student_id && typeof rec.student_id === 'object') {
										const sidObj: any = rec.student_id
										if (typeof sidObj.roll_number !== 'undefined') return Number(sidObj.roll_number)
										if (typeof sidObj._id !== 'undefined') {
											const found = students.find(s => String(s.id) === String(sidObj._id))
											return found?.roll_number ?? Infinity
										}
									}
									const sid = rec && rec.student_id ? String(rec.student_id) : ''
									const s = students.find(s => String(s.id) === sid)
									if (s && typeof s.roll_number !== 'undefined') return Number(s.roll_number)
									return Infinity
								}
								return getRoll(a) - getRoll(b)
							})
							.map(a => {
								const student = students.find(s => s.id === a.student_id || s.id === a.student_id?.toString?.())
								let studentName = ''
								let rollNumber = ''

								if (hasName(a.student_id) && typeof (a.student_id as any).roll_number !== 'undefined') {
									studentName = a.student_id.name
									rollNumber = String((a.student_id as any).roll_number)
								} else if (student) {
									studentName = student.name
									rollNumber = String(student.roll_number)
								} else if (typeof a.student_id === 'string' && a.student_id) {
									studentName = a.student_id
								}

								return (
									<li key={a.id} className='flex items-center justify-between px-4 py-3'>
										<div>
											<div className='font-medium text-base'>
												{rollNumber ? `${rollNumber}. ` : ''}
												{studentName}
											</div>
											<div className='text-xs text-gray-500'>
												{a.date
													? typeof a.date === 'string'
														? a.date.slice(0, 10)
														: new Date(a.date).toISOString().slice(0, 10)
													: ''}
											</div>
										</div>
										<Badge className={`${getStatusColor(a.status)} px-2 py-1 text-xs`}>
											{a.status.charAt(0).toUpperCase() + a.status.slice(1)}
										</Badge>
									</li>
								)
							})}
					</ul>
				)}
			</div>
		</div>
	)
}

export default AdminAttendanceHistory
