import bcrypt from 'bcrypt'
import User from '../models/User.js'

// Get current user's profile
export async function getMe(req, res) {
	try {
		const userId = req.user?.id
		if (!userId) return res.status(401).json({ message: 'Unauthorized' })
		const user = await User.findById(userId, { password: 0 })
		if (!user) return res.status(404).json({ message: 'User not found' })
		res.json(user)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Update current user's profile (name, email)
export async function updateMe(req, res) {
	try {
		const userId = req.user?.id
		if (!userId) return res.status(401).json({ message: 'Unauthorized' })
		const { name, email } = req.body
		if (!name || !email) return res.status(400).json({ message: 'Name and email are required' })
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: 'User not found' })
		user.name = name
		user.email = email
		await user.save()
		res.json({ message: 'Profile updated' })
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

export async function changePassword(req, res) {
	try {
		const userId = req.user?.id
		const { oldPassword, newPassword } = req.body
		if (!userId || !oldPassword || !newPassword) {
			return res.status(400).json({ message: 'Missing required fields' })
		}
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: 'User not found' })
		const valid = await bcrypt.compare(oldPassword, user.password)
		if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })
		const hash = await bcrypt.hash(newPassword, 10)
		user.password = hash
		await user.save()
		res.json({ message: 'Password changed successfully' })
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

export async function getAllUsers(_req, res) {
	// Return all users (excluding password)
	const users = await User.find({}, { password: 0 })
	res.json(users)
}
