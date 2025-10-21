import { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

const Students: React.FC = () => {
	const [students, setStudents] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const token = localStorage.getItem('token')

	useEffect(() => {
		const fetchStudents = async () => {
			setLoading(true)
			try {
				// Fetch all batches first
				const batchesRes = await fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } })
				const batches = await batchesRes.json()
				if (!Array.isArray(batches)) throw new Error('Failed to fetch batches')
				let allStudents: any[] = []
				for (const batch of batches) {
					const studentsRes = await fetch(`/api/batches/${batch.id}/students`, {
						headers: { Authorization: `Bearer ${token}` },
					})
					const studentsData = await studentsRes.json()
					if (Array.isArray(studentsData)) {
						// Add batch info for display
						allStudents = allStudents.concat(
							studentsData.map(s => ({ ...s, batch_name: batch.name, batch_class: batch.class }))
						)
					}
				}
				setStudents(allStudents)
			} catch (e) {
				setStudents([])
			}
			setLoading(false)
		}
		fetchStudents()
	}, [])

	return (
		<div className='p-2 sm:p-6 max-w-6xl mx-auto'>
			<h1 className='text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left'>All Students</h1>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Class</TableHead>
							<TableHead>Batch</TableHead>
							<TableHead>Roll No.</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6}>Loading...</TableCell>
							</TableRow>
						) : students.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6}>No students found.</TableCell>
							</TableRow>
						) : (
							Array.isArray(students) &&
							students.map(s => (
								<TableRow key={s.id || s.roll_number}>
									<TableCell>{s.name}</TableCell>
									<TableCell>{s.class}</TableCell>
									<TableCell>{s.batch_name || s.batch_id}</TableCell>
									<TableCell>{s.roll_number}</TableCell>
									<TableCell>{s.email}</TableCell>
									<TableCell>{s.phone}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

export default Students
