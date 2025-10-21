import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'

const API_URL = '/api'

interface AuthContextType {
	user: User | null
	login: (username: string, password: string) => Promise<void>
	register: (username: string, password: string, role: string) => Promise<void>
	logout: () => void
	loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const savedUser = localStorage.getItem('user')
		const token = localStorage.getItem('token')
		let parsedUser: User | null = null
		try {
			if (savedUser) {
				parsedUser = JSON.parse(savedUser)
			}
		} catch (e) {
			parsedUser = null
		}
		if (parsedUser && token && parsedUser.role) {
			setUser(parsedUser)
		} else {
			setUser(null)
			localStorage.removeItem('user')
			localStorage.removeItem('token')
		}
		setLoading(false)
		// Debug log
		// ...existing code...
	}, [])

	const login = async (username: string, password: string) => {
		setLoading(true)
		try {
			const res = await fetch(`${API_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			})
			if (!res.ok) throw new Error('Login failed')
			const data = await res.json()
			const userObj: User = {
				id: data.user.id,
				email: data.user.email || data.user.username || '',
				name: data.user.name || data.user.username || data.user.email || '',
				role: data.user.role,
				created_at: data.user.created_at || '',
			}
			setUser(userObj)
			localStorage.setItem('user', JSON.stringify(userObj))
			localStorage.setItem('token', data.token)
		} finally {
			setLoading(false)
		}
	}

	const register = async (username: string, password: string, role: string) => {
		setLoading(true)
		try {
			const res = await fetch(`${API_URL}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password, role }),
			})
			if (!res.ok) throw new Error('Registration failed')
			// Optionally auto-login after registration
			await login(username, password)
		} catch (error) {
			throw error
		} finally {
			setLoading(false)
		}
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('user')
		localStorage.removeItem('token')
	}

	return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}
