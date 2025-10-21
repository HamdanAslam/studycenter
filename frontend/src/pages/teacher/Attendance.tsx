import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, Save, UserCheck, UserX, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Batch {
	id: string
	name: string
}

interface Student {
	id: string
	name: string
	class: number
	roll_number: number
}

type AttendanceStatus = 'present' | 'absent' | 'late'

function TakeAttendance() {
	const [batches, setBatches] = useState<Batch[]>([])
	const [students, setStudents] = useState<Student[]>([])
	const [studentError, setStudentError] = useState<string | null>(null)
	const [selectedBatch, setSelectedBatch] = useState('')
	// Set selectedDate to today by default
	const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return today
	})
	const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
	const [loading, setLoading] = useState(false)
	const { toast } = useToast()
	const navigate = useNavigate()
	const token = localStorage.getItem('token')

	// Fetch batches on mount
	useEffect(() => {
		async function fetchBatches() {
			setLoading(true)
			try {
				const res = await fetch('/api/batches', {
					headers: { Authorization: `Bearer ${token}` },
				})
				if (!res.ok) throw new Error('Failed to fetch batches')
				const data = await res.json()
				setBatches(data)
			} catch (e) {
				setBatches([])
			} finally {
				setLoading(false)
			}
		}
		fetchBatches()
		// eslint-disable-next-line
	}, [])

	// Fetch students when batch changes
	useEffect(() => {
		if (!selectedBatch) {
			setStudents([])
			setAttendance({})
			return
		}
		async function fetchStudents() {
			setLoading(true)
			setStudentError(null)
			try {
				const res = await fetch(`/api/batches/${selectedBatch}/students`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				if (!res.ok) throw new Error('Failed to fetch students')
				const data = await res.json()
				setStudents(data)
				setAttendance({})
			} catch (e: any) {
				setStudents([])
				setAttendance({})
				setStudentError(e?.message || 'Unknown error')
				console.error('Error fetching students:', e)
			} finally {
				setLoading(false)
			}
		}
		fetchStudents()
		// eslint-disable-next-line
	}, [selectedBatch])

	// Fetch attendance for batch/date and prefill
	useEffect(() => {
		if (!selectedBatch || !selectedDate || students.length === 0) {
			setAttendance({})
			return
		}
		async function fetchAttendance() {
			setLoading(true)
			try {
				const res = await fetch(
					`/api/attendance/batch-date?batch_id=${selectedBatch}&date=${format(selectedDate, 'yyyy-MM-dd')}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				)
				if (!res.ok) throw new Error('Failed to fetch attendance')
				const data = await res.json()
				// Prefill attendance: { studentId: status }
				const att: Record<string, AttendanceStatus> = {}
				for (const rec of data) {
					if (rec.student_id && rec.status) {
						// rec.student_id can be object or string
						const sid = typeof rec.student_id === 'string' ? rec.student_id : rec.student_id._id
						att[sid] = rec.status
					}
				}
				setAttendance(att)
			} catch (e) {
				setAttendance({})
			} finally {
				setLoading(false)
			}
		}
		fetchAttendance()
		// eslint-disable-next-line
	}, [selectedBatch, selectedDate, students.length])

	// Attendance marking: cycle present → absent → late → present
	function markAttendance(studentId: string) {
		setAttendance(prev => {
			const current = prev[studentId] || 'present'
			let next: AttendanceStatus
			if (current === 'present') next = 'absent'
			else if (current === 'absent') next = 'late'
			else next = 'present'
			return { ...prev, [studentId]: next }
		})
	}

	// Save or update attendance (bulk upsert)
	async function saveAttendance() {
		if (!selectedBatch || !selectedDate) return
		setLoading(true)
		try {
			const records = students.map(s => ({
				student_id: s.id,
				status: attendance[s.id] ?? 'present',
			}))
			const res = await fetch('/api/attendance/bulk-upsert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					batch_id: selectedBatch,
					date: format(selectedDate, 'yyyy-MM-dd'),
					records,
				}),
			})
			if (!res.ok) throw new Error('Failed to save attendance')
			toast({
				title: 'Attendance saved',
				description: `Attendance for ${format(selectedDate, 'PPP')} saved successfully.`,
			})
			// Redirect to homepage after successful save
			setTimeout(() => navigate('/'), 500)
		} catch (e) {
			toast({
				title: 'Failed to save attendance',
				description: 'Please try again.',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	// Helpers
	function getStatusColor(status: AttendanceStatus) {
		switch (status) {
			case 'present':
				return 'bg-success/10 text-success border-success/20'
			case 'absent':
				return 'bg-destructive/10 text-destructive border-destructive/20'
			case 'late':
				return 'bg-warning/10 text-warning border-warning/20'
			default:
				return 'bg-muted'
		}
	}
	function getStatusIcon(status: AttendanceStatus) {
		switch (status) {
			case 'present':
				return <UserCheck className='h-4 w-4' />
			case 'absent':
				return <UserX className='h-4 w-4' />
			case 'late':
				return <Clock className='h-4 w-4' />
			default:
				return null
		}
	}

	// Attendance summary
	const presentCount = students.filter(s => (attendance[s.id] ?? 'present') === 'present').length
	const absentCount = students.filter(s => (attendance[s.id] ?? 'present') === 'absent').length
	const lateCount = students.filter(s => (attendance[s.id] ?? 'present') === 'late').length

	return (
		<div className='space-y-6 px-2 sm:px-4 max-w-5xl mx-auto'>
			<div>
				<h1 className='text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left'>Take Attendance</h1>
				<p className='text-muted-foreground text-center sm:text-left'>Mark student attendance for your classes</p>
			</div>
			{studentError && (
				<div className='bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded mb-4'>
					Error loading students: {studentError}
				</div>
			)}

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>Select Class & Date</CardTitle>
						<CardDescription>Choose the batch and date for attendance</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Select Batch</label>
							<select
								className='w-full border rounded p-2 text-sm bg-background text-foreground transition-colors'
								value={selectedBatch}
								onChange={e => setSelectedBatch(e.target.value)}
								disabled={loading}
							>
								<option value=''>Choose a batch</option>
								{batches
									.filter(batch => batch.id)
									.map(batch => (
										<option key={batch.id} value={batch.id}>
											{batch.name}
										</option>
									))}
							</select>
							{batches.filter(batch => !batch.id).length > 0 && (
								<div style={{ color: 'red', fontSize: 12 }}>
									Warning: {batches.filter(batch => !batch.id).length} batches missing an <b>id</b> and will not
									be shown!
								</div>
							)}
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium'>Select Date</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!selectedDate && 'text-muted-foreground'
										)}
										disabled={loading}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0'>
									<Calendar
										mode='single'
										selected={selectedDate}
										onSelect={date => setSelectedDate(date ?? null)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Students list will show automatically below when batch and date are selected */}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Attendance Summary</CardTitle>
						<CardDescription>Current attendance status</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-medium'>Total Students:</span>
								<span className='text-sm'>{students.length}</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-medium text-success'>Present:</span>
								<span className='text-sm'>{presentCount}</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-medium text-destructive'>Absent:</span>
								<span className='text-sm'>{absentCount}</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-medium text-warning'>Late:</span>
								<span className='text-sm'>{lateCount}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{selectedBatch && selectedDate && students.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='text-lg sm:text-xl'>Student Attendance</CardTitle>
						<CardDescription>
							Mark attendance for {batches.find(b => b.id === selectedBatch)?.name} - {format(selectedDate, 'PPP')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='overflow-x-auto pb-2'>
							<div className='grid grid-cols-4 sm:grid-cols-5 gap-3 min-w-[340px]'>
								{students
									.filter(s => s.id)
									.sort((a, b) => a.roll_number - b.roll_number)
									.map(student => {
										const status = attendance[student.id] ?? 'present'
										let statusColor = getStatusColor(status)
										return (
											<button
												key={student.id || student.roll_number}
												className={cn(
													'flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50',
													statusColor,
													'active:scale-95',
													'min-h-[60px] sm:min-h-[110px]'
												)}
												onClick={() => markAttendance(student.id)}
												type='button'
											>
												{/* Show only roll number on phone, name+status on sm+ */}
												<span className='text-base font-bold'>{student.roll_number}</span>
												<span className='hidden sm:block font-medium text-sm sm:text-base'>
													{student.name}
												</span>
												<span className='mt-2 hidden sm:flex items-center gap-1 text-xs capitalize'>
													{getStatusIcon(status)}
													{status}
												</span>
											</button>
										)
									})}
							</div>
						</div>
						<div className='mt-6 flex flex-col sm:flex-row sm:justify-end gap-2'>
							<Button onClick={saveAttendance} disabled={loading} className='w-full sm:w-auto'>
								<Save className='mr-2 h-4 w-4' />
								Save Attendance
							</Button>
							<Button
								variant='outline'
								className='w-full sm:w-auto'
								onClick={() => {
									if (!selectedBatch) return
									const y = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
									const m = selectedDate ? selectedDate.getMonth() + 1 : new Date().getMonth() + 1
									navigate(`/teacher/attendance-monthly?batch_id=${selectedBatch}&year=${y}&month=${m}`)
								}}
							>
								Monthly View
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
export default TakeAttendance
