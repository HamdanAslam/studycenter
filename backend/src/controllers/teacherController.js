import Teacher from '../models/Teacher.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// List all teachers
export async function listTeachers(_req, res) {
	const teachers = await Teacher.find().sort({ _id: 1 })
	res.json(teachers)
}

// Get a single teacher
export async function getTeacher(req, res) {
	const teacher = await Teacher.findById(req.params.id)
	if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
	res.json(teacher)
}

// Create a teacher
export async function addTeacher(req, res) {
	const { name, email, phone, subjects, password } = req.body
	if (!name) return res.status(400).json({ message: 'Missing name' })
	if (!email) return res.status(400).json({ message: 'Missing email' })
	if (!password) return res.status(400).json({ message: 'Missing password' })

	// Check if user already exists
	const existingUser = await User.findOne({ username: email })
	if (existingUser) return res.status(409).json({ message: 'A user with this email already exists' })

	const teacher = new Teacher({ name, email, phone, subjects })
	await teacher.save()
	const hash = await bcrypt.hash(password, 10)
	const user = new User({ username: email, password: hash, role: 'teacher' })
	await user.save()
	res.status(201).json(teacher)
}

// Update a teacher
export async function editTeacher(req, res) {
	const { name, email, phone, subjects } = req.body
	const teacher = await Teacher.findByIdAndUpdate(req.params.id, { name, email, phone, subjects }, { new: true })
	if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
	res.json(teacher)
}

// Delete a teacher and corresponding user
export async function removeTeacher(req, res) {
	const teacher = await Teacher.findById(req.params.id)
	if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
	await Teacher.findByIdAndDelete(req.params.id)
	await User.deleteOne({ username: teacher.email })
	res.status(204).end()
}
