import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface Student {
	id: string
	name: string
	class: string | number
	batch_id?: string
	roll_number?: number
	email?: string
	phone?: string
}

const Batches: React.FC = () => {
	const [batches, setBatches] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
	const [students, setStudents] = useState<Student[]>([])
	const [studentsLoading, setStudentsLoading] = useState(false)
	const token = localStorage.getItem('token')

	useEffect(() => {
		const fetchBatches = async () => {
			setLoading(true)
			const res = await fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } })
			const data = await res.json()
			setBatches(data)
			setLoading(false)
		}
		fetchBatches()
	}, [])

	const handleBatchClick = async (batchId: string) => {
		setSelectedBatchId(batchId)
		setStudents([])
		setStudentsLoading(true)
		try {
			const res = await fetch(`/api/batches/${batchId}/students`, { headers: { Authorization: `Bearer ${token}` } })
			const data = await res.json()
			setStudents(Array.isArray(data) ? data : [])
		} catch {
			setStudents([])
		}
		setStudentsLoading(false)
	}

	return (
		<div className='p-2 sm:p-6 max-w-6xl mx-auto'>
			<h1 className='text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left'>All Batches</h1>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Class</TableHead>
							<TableHead>Schedule</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={3}>Loading...</TableCell>
							</TableRow>
						) : batches.length === 0 ? (
							<TableRow>
								<TableCell colSpan={3}>No batches found.</TableCell>
							</TableRow>
						) : (
							batches.map(b => (
								<TableRow key={b.id} className={selectedBatchId === b.id ? 'bg-accent' : ''}>
									<TableCell>
										<button className='text-blue-600 underline' onClick={() => handleBatchClick(b.id)}>
											{b.name}
										</button>
									</TableCell>
									<TableCell>{b.class}</TableCell>
									<TableCell>{b.schedule}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			{selectedBatchId && (
				<div className='mt-8'>
					<h2 className='text-xl font-semibold mb-2'>Students in Batch</h2>
					{studentsLoading ? (
						<div>Loading students...</div>
					) : students.length === 0 ? (
						<div>No students found for this batch.</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Roll No.</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Phone</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{students.map(s => (
										<TableRow key={s.id}>
											<TableCell>{s.name}</TableCell>
											<TableCell>{s.roll_number}</TableCell>
											<TableCell>{s.email}</TableCell>
											<TableCell>{s.phone}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Batches
