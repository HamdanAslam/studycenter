import Batch from '../models/Batch.js'
import Student from '../models/Student.js'

// List all batches, including students for each batch
export async function listBatches(_req, res) {
	const batches = await Batch.find().sort({ _id: 1 })
	// For each batch, fetch students with matching batch_id
	const batchWithStudents = await Promise.all(
		batches.map(async batch => {
			const students = await Student.find({ batch_id: batch._id })
			return {
				...batch.toObject(),
				id: batch._id.toString(),
				students: students.map(s => ({ ...s.toObject(), id: s._id.toString() })),
			}
		})
	)
	res.json(batchWithStudents)
}

// Get a single batch
export async function getBatch(req, res) {
	const batch = await Batch.findById(req.params.id)
	if (!batch) return res.status(404).json({ message: 'Batch not found' })
	// Fetch students for this batch
	const students = await Student.find({ batch_id: batch._id })
	const mappedStudents = Array.isArray(students) ? students.map(s => ({ ...s.toObject(), id: s._id.toString() })) : []
	res.json({ ...batch.toObject(), id: batch._id.toString(), students: mappedStudents })
}

// Create a batch
export async function addBatch(req, res) {
	const { name, class: classNum, schedule } = req.body
	if (!name || !classNum) return res.status(400).json({ message: 'Missing fields' })
	const batch = new Batch({ name, class: classNum, schedule })
	await batch.save()
	res.status(201).json(batch)
}

// Update a batch
export async function editBatch(req, res) {
	const { name, class: classNum, schedule } = req.body
	const batch = await Batch.findByIdAndUpdate(req.params.id, { name, class: classNum, schedule }, { new: true })
	if (!batch) return res.status(404).json({ message: 'Batch not found' })
	res.json(batch)
}

// Delete a batch
export async function removeBatch(req, res) {
	await Batch.findByIdAndDelete(req.params.id)
	res.status(204).end()
}
