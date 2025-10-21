export interface User {
	id: string
	email: string
	name: string
	role: 'admin' | 'teacher'
	created_at: string
}

export interface Student {
	id: string
	name: string
	email: string
	phone: string
	class: 8 | 9 | 10
	batch_id?: string
	roll_number: number
	created_at: string
}

export interface Teacher {
	id: string
	name: string
	email: string
	phone: string
	subjects: Subject[]
	created_at: string
}

export interface Batch {
	id: string
	name: string
	class: 8 | 9 | 10
	students: Student[]
	schedule: string
	created_at: string
}

export interface AttendanceRecord {
	id: string
	student_id: string
	batch_id: string
	date: string
	status: 'present' | 'absent' | 'late'
	created_at: string
}

export type Subject = 'Maths' | 'Physics' | 'Chemistry' | 'English'

export interface AttendanceSession {
	id: string
	batch_id: string
	date: string
	teacher_id: string
	records: AttendanceRecord[]
}

export interface StudentAttendanceStats {
	total: number
	present: number
	absent: number
	late: number
	percentage: number
	history: AttendanceRecord[]
}
