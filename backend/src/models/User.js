import mongoose from '../utils/db.js'

const userSchema = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['admin', 'teacher'], required: true },
	created_at: { type: Date, default: Date.now },
})

const User = mongoose.model('User', userSchema)
export default User
