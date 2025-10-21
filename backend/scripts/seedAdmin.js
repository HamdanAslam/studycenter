import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../src/models/User.js' // your actual schema

async function connectDB() {
	try {
		await mongoose.connect('mongodb://localhost:27017/attenl')
		console.log('Connected to MongoDB')
	} catch (err) {
		console.error('MongoDB connection error:', err)
		process.exit(1)
	}
}

async function seedAdmin() {
	const existingAdmin = await User.findOne({ username: 'admin' })
	if (existingAdmin) {
		console.log('Admin already exists')
		return
	}

	const hashedPassword = await bcrypt.hash('password', 10)

	await User.create({
		username: 'admin', // required
		password: hashedPassword, // required
		role: 'admin', // required enum
	})

	console.log('Admin account created: username=admin / password=password')
}

async function runSeed() {
	await connectDB()
	try {
		await seedAdmin()
	} catch (err) {
		console.error(err)
	} finally {
		await mongoose.connection.close()
		console.log('MongoDB connection closed')
	}
}

runSeed()
