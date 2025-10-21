import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function login(req, res) {
	const { username, password } = req.body
	const user = await User.findOne({ username })
	if (!user) return res.status(401).json({ message: 'Invalid credentials' })
	const valid = await bcrypt.compare(password, user.password)
	if (!valid) return res.status(401).json({ message: 'Invalid credentials' })
	const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })
	res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
}

export async function register(req, res) {
	const { username, password, role } = req.body
	const existing = await User.findOne({ username })
	if (existing) return res.status(409).json({ message: 'User already exists' })
	const hash = await bcrypt.hash(password, 10)
	const user = new User({ username, password: hash, role })
	await user.save()
	res.status(201).json({ id: user.id, username: user.username, role: user.role })
}
