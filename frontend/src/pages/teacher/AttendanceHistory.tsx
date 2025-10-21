// Type guard for object with name property
function hasName(obj: unknown): obj is { name: string } {
	return !!obj && typeof obj === 'object' && 'name' in obj && typeof (obj as any).name === 'string'
}
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Student, AttendanceRecord } from '@/types'

const AttendanceHistory: React.FC = () => {
	const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
	const [batches, setBatches] = useState<any[]>([])
	const [students, setStudents] = useState<Student[]>([])
	const [selectedBatch, setSelectedBatch] = useState('')
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [selectedStudent, setSelectedStudent] = useState('all')
	const [selectedStatus, setSelectedStatus] = useState('all')
	const [loading, setLoading] = useState(false)
	const [viewStudent, setViewStudent] = useState<Student | null>(null)
	const token = localStorage.getItem('token')

	useEffect(() => {
		fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.json())
			.then(setBatches)
	}, [])

	useEffect(() => {
		if (!selectedBatch) return
		fetch(`/api/batches/${selectedBatch}`, { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.json())
			.then(batch => {
				// Ensure students array is sorted by roll_number for consistent display
				const s = batch.students || []
				try {
					setStudents(Array.isArray(s) ? [...s].sort((a, b) => (a?.roll_number || 0) - (b?.roll_number || 0)) : [])
				} catch (e) {
					setStudents(s)
				}
			})
	}, [selectedBatch])

	const fetchAttendance = async (studentIdOverride?: string) => {
		setLoading(true)
		let url = '/api/attendance'
		const params = []
		if (selectedBatch) params.push(`batch_id=${selectedBatch}`)
		if (selectedDate) params.push(`date=${selectedDate.toISOString().slice(0, 10)}`)
		if (studentIdOverride) {
			params.push(`student_id=${studentIdOverride}`)
		} else if (selectedStudent && selectedStudent !== 'all') {
			params.push(`student_id=${selectedStudent}`)
		}
		if (selectedStatus && selectedStatus !== 'all') params.push(`status=${selectedStatus}`)
		if (params.length) url += '?' + params.join('&')
		const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
		let data = await res.json()
		let attendanceArr = []
		if (Array.isArray(data)) {
			attendanceArr = data.map(a => ({ ...a, id: a._id || a.id }))
		} else if (data && Array.isArray(data.attendance)) {
			attendanceArr = data.attendance.map(a => ({ ...a, id: a._id || a.id }))
		}
		setAttendance(attendanceArr)
		setLoading(false)
	}

	useEffect(() => {
		if (selectedBatch) {
			fetchAttendance()
		} else {
			setAttendance([])
		}
		// eslint-disable-next-line
	}, [selectedBatch, selectedDate, selectedStudent, selectedStatus])

	return (
		<div className='max-w-2xl mx-auto px-2 sm:px-0 py-6'>
			<h1 className='text-2xl font-bold mb-6 text-center'>Attendance History</h1>
			<div className='bg-card border rounded-lg p-4 mb-8 flex flex-col gap-4 max-w-md mx-auto'>
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
				<Button onClick={() => fetchAttendance()} className='w-full mt-2'>
					Refresh
				</Button>
			</div>
			<div>
				{viewStudent ? (
					<div className='mb-4'>
						<Button variant='outline' onClick={() => setViewStudent(null)} className='mb-2'>
							&larr; Back to all
						</Button>
						<h2 className='text-lg font-semibold mb-3 text-center'>Attendance for {viewStudent.name}</h2>
						<div className='flex flex-col gap-2'>
							{loading ? (
								<div className='text-center py-4'>Loading...</div>
							) : attendance.length === 0 ? (
								<div className='text-center py-4'>No records found.</div>
							) : (
								attendance.map(a => (
									<div
										key={a.id || a.student_id}
										className='rounded border p-3 flex items-center justify-between bg-card border-border'
									>
										<span>
											{a.date
												? typeof a.date === 'string'
													? a.date.slice(0, 10)
													: new Date(a.date).toISOString().slice(0, 10)
												: ''}
										</span>
										<Badge>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</Badge>
									</div>
								))
							)}
						</div>
					</div>
				) : (
					<>
						<h2 className='text-lg font-semibold mb-3 text-center'>Attendance Records</h2>
						{loading ? (
							<div className='text-center py-4'>Loading...</div>
						) : attendance.length === 0 ? (
							<div className='text-center py-4'>No attendance records found.</div>
						) : (
							<ul className='divide-y divide-border rounded border bg-card border-border'>
								{attendance
									.sort((a, b) => {
										// Robustly extract roll number from attendance record (student_id can be object, id, or string)
										const getRoll = (rec: any) => {
											// If student_id is populated as an object with roll_number
											if (
												rec &&
												typeof rec === 'object' &&
												rec.student_id &&
												typeof rec.student_id === 'object'
											) {
												const sidObj: any = rec.student_id
												if (typeof sidObj.roll_number !== 'undefined') return Number(sidObj.roll_number)
												if (typeof sidObj._id !== 'undefined') {
													const found = students.find(s => String(s.id) === String(sidObj._id))
													return found?.roll_number ?? Infinity
												}
											}
											// If student_id is a plain id (string/number), look up in students array
											const sid = rec && rec.student_id ? String(rec.student_id) : ''
											const s = students.find(s => String(s.id) === sid)
											if (s && typeof s.roll_number !== 'undefined') return Number(s.roll_number)
											// Fallback large number so unknowns go to the end
											return Infinity
										}
										return getRoll(a) - getRoll(b)
									})
									.map(a => {
										const student = students.find(
											s =>
												s.id === a.student_id ||
												s.id === (a.student_id && a.student_id.toString && a.student_id.toString())
										)
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
										let statusColor = 'bg-muted text-muted-foreground'
										if (a.status === 'present') statusColor = 'bg-accent text-accent-foreground'
										else if (a.status === 'absent') statusColor = 'bg-destructive text-destructive-foreground'
										else if (a.status === 'late') statusColor = 'bg-warning text-warning-foreground'
										return (
											<li key={a.id} className='flex items-center justify-between px-4 py-3'>
												<div>
													<div className='font-medium text-base'>
														{rollNumber ? `${rollNumber}. ` : ''}
														{studentName}
													</div>
													<div className='text-xs text-muted-foreground'>
														{a.date
															? typeof a.date === 'string'
																? a.date.slice(0, 10)
																: new Date(a.date).toISOString().slice(0, 10)
															: ''}
													</div>
												</div>
												<Badge className={statusColor + ' px-2 py-1 text-xs'}>
													{a.status.charAt(0).toUpperCase() + a.status.slice(1)}
												</Badge>
											</li>
										)
									})}
							</ul>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default AttendanceHistory
