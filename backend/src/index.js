import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './utils/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import attendanceRoutes from './routes/attendance.js'
import batchRoutes from './routes/batch.js'
import dashboardRoutes from './routes/dashboard.js'
import studentRoutes from './routes/student.js'
import teacherRoutes from './routes/teacher.js'
import externalAttendanceRoutes from './routes/externalAttendance.js'
import externalAuthRoutes from './routes/externalAuth.js'

dotenv.config()

// Connect to MongoDB before starting the server
await connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/students', studentRoutes)

app.use('/api/teachers', teacherRoutes)
// External API for third-party integrations (protected by bearer tokens)
app.use('/api/external/attendance', externalAttendanceRoutes)
app.use('/api/external/auth', externalAuthRoutes)

app.get('/', (_req, res) => {
	res.send('Attendance Management System Backend')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
	// ...existing code...
})
