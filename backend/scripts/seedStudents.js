import 'dotenv/config'
import mongoose from 'mongoose'
import Student from '../src/models/Student.js'
import Batch from '../src/models/Batch.js'

// Connect to MongoDB
async function connectDB() {
	try {
		await mongoose.connect('mongodb://localhost:27017/attenl', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		console.log('Connected to MongoDB')
	} catch (err) {
		console.error('MongoDB connection error:', err)
		process.exit(1)
	}
}

// Helpers
function randomName() {
	const first = ['Alex', 'Sam', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Drew', 'Skyler']
	const last = ['Smith', 'Lee', 'Patel', 'Kim', 'Garcia', 'Brown', 'Nguyen', 'Singh', 'Chen', 'Khan']
	return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`
}

function randomEmail(name, i) {
	return name.toLowerCase().replace(/ /g, '.') + i + '@school.com'
}

function randomPhone() {
	return '9' + Math.floor(100000000 + Math.random() * 900000000)
}

// Seed students
async function seedStudents() {
	await connectDB()
	const batch = await Batch.findOne()
	if (!batch) throw new Error('No batch found in DB')

	const students = Array.from({ length: 30 }).map((_, i) => {
		const name = randomName()
		return {
			name,
			class: batch.class,
			batch_id: batch._id,
			roll_number: i + 1,
			email: randomEmail(name, i + 1),
			phone: randomPhone(),
		}
	})

	await Student.insertMany(students)
	console.log('Seeded 30 students to batch', batch.name)

	await mongoose.connection.close()
	console.log('MongoDB connection closed')
}

seedStudents().catch(err => {
	console.error(err)
	process.exit(1)
})
