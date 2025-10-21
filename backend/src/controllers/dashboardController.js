import mongoose from '../utils/db.js'
import mongoosePkg from 'mongoose'
const { model } = mongoosePkg
const User = model('User')
const Attendance = model('Attendance')
import Student from '../models/Student.js'

export async function getDashboardStats(_req, res) {
	const studentCount = await Student.countDocuments()
	const teacherCount = await User.countDocuments({ role: 'teacher' })
	const attendanceCount = await Attendance.countDocuments()
	res.json({
		studentCount,
		teacherCount,
		attendanceCount,
	})
}
