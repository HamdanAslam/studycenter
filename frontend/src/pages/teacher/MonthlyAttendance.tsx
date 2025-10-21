import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Student } from '@/types'

interface MonthlyStudent {
	id: string
	name: string
	roll_number: number | null
	records: Record<string, string>
}

const MonthlyAttendance: React.FC = () => {
	const [batches, setBatches] = useState<any[]>([])
	const [selectedBatch, setSelectedBatch] = useState('')
	const [year, setYear] = useState<number>(new Date().getFullYear())
	const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
	const [days, setDays] = useState<string[]>([])
	const [students, setStudents] = useState<MonthlyStudent[]>([])
	const [loading, setLoading] = useState(false)
	const [compact, setCompact] = useState(false)
	const token = localStorage.getItem('token')

	useEffect(() => {
		fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } })
			.then(r => r.json())
			.then(setBatches)
			.catch(() => setBatches([]))
	}, [])

	const fetchMonthly = async (batchArg?: string, yearArg?: number, monthArg?: number) => {
		const batchId = batchArg ?? selectedBatch
		const y = yearArg ?? year
		const m = monthArg ?? month
		if (!batchId) return
		setLoading(true)
		try {
			const res = await fetch(`/api/attendance/monthly?batch_id=${batchId}&year=${y}&month=${m}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!res.ok) throw new Error('Failed')
			const data = await res.json()
			setDays(data.days || [])
			setStudents(data.students || [])
			// update UI selections if provided
			if (batchArg) setSelectedBatch(batchArg)
			if (typeof yearArg === 'number') setYear(yearArg)
			if (typeof monthArg === 'number') setMonth(monthArg)
		} catch (e) {
			setDays([])
			setStudents([])
		} finally {
			setLoading(false)
		}
	}

	// auto-load from URL params if present
	const location = useLocation()
	useEffect(() => {
		const params = new URLSearchParams(location.search)
		const b = params.get('batch_id')
		const y = params.get('year')
		const m = params.get('month')
		if (b && y && m) {
			const yi = parseInt(y, 10)
			const mi = parseInt(m, 10)
			if (!Number.isNaN(yi) && !Number.isNaN(mi)) {
				// fetch with provided params
				fetchMonthly(b, yi, mi)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	function statusColorClass(status?: string) {
		if (!status) return 'bg-transparent'
		switch (status) {
			case 'present':
				return 'bg-accent'
			case 'absent':
				return 'bg-destructive'
			case 'late':
				return 'bg-warning'
			default:
				return 'bg-muted'
		}
	}

	return (
		<div className='max-w-5xl mx-auto px-4 py-6'>
			<h1 className='text-2xl font-bold mb-4'>Monthly Attendance</h1>
			<div className='bg-card border rounded p-4 mb-6 flex flex-wrap gap-4'>
				<div className='w-64'>
					<label className='block text-sm font-medium mb-1'>Batch</label>
					<Select value={selectedBatch} onValueChange={setSelectedBatch}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select batch' />
						</SelectTrigger>
						<SelectContent>
							{batches.map(b => (
								<SelectItem key={b.id} value={String(b.id)}>
									{b.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className='flex items-end gap-2'>
					<div>
						<label className='block text-sm font-medium mb-1'>Year</label>
						<input
							type='number'
							value={year}
							onChange={e => setYear(Number(e.target.value))}
							className='w-24 border rounded p-2'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-1'>Month</label>
						<select value={month} onChange={e => setMonth(Number(e.target.value))} className='border rounded p-2'>
							{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
								<option key={m} value={m}>
									{m}
								</option>
							))}
						</select>
					</div>
					<Button onClick={() => fetchMonthly()} className='h-10'>
						Load
					</Button>
				</div>

				<div className='ml-auto flex items-center gap-4'>
					<label className='flex items-center gap-2'>
						<input type='checkbox' checked={compact} onChange={e => setCompact(e.target.checked)} />
						<span className='text-sm'>Compact view</span>
					</label>
				</div>
			</div>

			<div>
				{loading ? (
					<div className='text-center py-8'>Loading...</div>
				) : students.length === 0 ? (
					<div className='text-center py-8'>No data</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='min-w-full border-collapse'>
								<thead>
									<tr>
										<th className='sticky top-0 left-0 bg-card z-20 border p-2' style={{ left: 0 }}>
											#
										</th>
										<th className='sticky top-0 left-14 bg-card z-20 border p-2' style={{ left: '3.5rem' }}>
											Student
										</th>
										{days.map(d => (
											<th key={d} className='border p-1 text-xs'>
												{d.slice(-2)}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{students.map(s => (
										<tr key={s.id} className='border-b'>
											<td className='p-2 sticky left-0 bg-card z-10'>{s.roll_number ?? '-'}</td>
											<td className='p-2 sticky left-14 bg-card z-10' style={{ left: '3.5rem' }}>
												{s.roll_number ? `${s.roll_number}. ` : ''}
												{s.name}
											</td>
											{days.map(d => (
												<td key={d} className='p-1 text-center'>
													{(() => {
														const useCompact = compact || days.length > 12 || students.length > 30
														const status = s.records && s.records[d]
														if (useCompact) {
															return (
																<div
																	className={`mx-auto h-2 w-2 rounded-full ${statusColorClass(
																		status
																	)}`}
																	title={
																		status
																			? status.charAt(0).toUpperCase() + status.slice(1)
																			: 'No data'
																	}
																	aria-label={status || 'none'}
																/>
															)
														}
														return status ? (
															<Badge>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
														) : null
													})()}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Legend */}
						<div className='mt-2 flex items-center gap-4'>
							<div className='flex items-center gap-2'>
								<div className='h-3 w-3 rounded-full bg-accent' /> <span className='text-sm'>Present</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='h-3 w-3 rounded-full bg-destructive' /> <span className='text-sm'>Absent</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='h-3 w-3 rounded-full bg-warning' /> <span className='text-sm'>Late</span>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default MonthlyAttendance
