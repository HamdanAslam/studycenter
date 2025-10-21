import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'

interface BatchForm {
	id?: string
	name: string
	class: string
	schedule: string
}

const Batches: React.FC = () => {
	const [batches, setBatches] = useState<any[]>([])
	// const [teachers, setTeachers] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [editBatch, setEditBatch] = useState<any | null>(null)
	const { register, handleSubmit, reset } = useForm<BatchForm>()
	const token = localStorage.getItem('token')

	// Fetch batches
	const fetchBatches = async () => {
		setLoading(true)
		const res = await fetch('/api/batches', {
			headers: { Authorization: `Bearer ${token}` },
		})
		const data = await res.json()
		setBatches(data)
		setLoading(false)
	}

	// No teacher selection needed

	useEffect(() => {
		fetchBatches()
	}, [])

	// Add or edit batch
	const onSubmit = async (values: BatchForm) => {
		const body = {
			...values,
			class: parseInt(values.class, 10),
		}
		if (editBatch) {
			await fetch(`/api/batches/${editBatch.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(body),
			})
		} else {
			await fetch('/api/batches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(body),
			})
		}
		setOpen(false)
		setEditBatch(null)
		reset()
		fetchBatches()
	}

	// Delete batch
	const handleDelete = async (id: string) => {
		if (!window.confirm('Delete this batch?')) return
		await fetch(`/api/batches/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		fetchBatches()
	}

	// Open edit modal
	const handleEdit = (batch: any) => {
		setEditBatch(batch)
		reset({
			id: batch.id,
			name: batch.name,
			class: String(batch.class),
			schedule: batch.schedule || '',
		})
		setOpen(true)
	}

	// Open add modal
	const handleAdd = () => {
		setEditBatch(null)
		reset({ name: '', class: '', schedule: '' })
		setOpen(true)
	}

	return (
		<div className='p-2 sm:p-6 max-w-6xl mx-auto'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
				<h1 className='text-2xl sm:text-3xl font-bold text-center sm:text-left'>Manage Batches</h1>
				<Button onClick={handleAdd} className='w-full sm:w-auto'>
					Add Batch
				</Button>
			</div>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Class</TableHead>
							{/* <TableHead>Teacher</TableHead> */}
							<TableHead>Schedule</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5}>Loading...</TableCell>
							</TableRow>
						) : batches.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5}>No batches found.</TableCell>
							</TableRow>
						) : (
							batches.map(b => (
								<TableRow key={b.id}>
									<TableCell>{b.name}</TableCell>
									<TableCell>{b.class}</TableCell>
									{/* <TableCell>{teachers.find(t => t.id === b.teacher_id)?.name || b.teacher_id}</TableCell> */}
									<TableCell>{b.schedule}</TableCell>
									<TableCell>
										<Button size='sm' variant='outline' onClick={() => handleEdit(b)}>
											Edit
										</Button>
										<Button
											size='sm'
											variant='destructive'
											onClick={() => handleDelete(b.id)}
											className='ml-2'
										>
											Delete
										</Button>
										<Button
											size='sm'
											variant='secondary'
											className='ml-2'
											onClick={() => (window.location.href = `/admin/batches/${b.id}/students`)}
										>
											View Students
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
						<h2 className='text-xl font-bold mb-2'>{editBatch ? 'Edit Batch' : 'Add Batch'}</h2>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
						<Input placeholder='Name' {...register('name', { required: true })} />
						<select {...register('class', { required: true })} className='w-full border rounded-md p-2'>
							<option value=''>Select Class</option>
							<option value='8'>8</option>
							<option value='9'>9</option>
							<option value='10'>10</option>
						</select>
						{/* No teacher selection */}
						<Input placeholder='Schedule (optional)' {...register('schedule')} />
						<DialogFooter>
							<Button type='submit'>{editBatch ? 'Save Changes' : 'Add Batch'}</Button>
							<Button type='button' variant='outline' onClick={() => setOpen(false)}>
								Cancel
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Batches
