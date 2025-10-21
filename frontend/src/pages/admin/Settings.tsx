import React, { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Settings: React.FC = () => {
	const [user, setUser] = useState<any>(null)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [saving, setSaving] = useState(false)
	const [changingPassword, setChangingPassword] = useState(false)
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const token = localStorage.getItem('token')
	const { toast } = useToast()

	useEffect(() => {
		fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.json())
			.then(data => {
				setUser(data)
				setName(data.name || '')
				setEmail(data.email || '')
			})
	}, [])

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		const res = await fetch('/api/me', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ name, email }),
		})
		setSaving(false)
		if (res.ok) {
			toast({ title: 'Profile updated', description: 'Your profile has been updated.' })
		} else {
			const data = await res.json().catch(() => ({}))
			toast({
				title: 'Failed to update profile',
				description: data.message || 'An error occurred.',
				variant: 'destructive',
			})
		}
	}

	return (
		<div className='p-2 sm:p-6 max-w-xl w-full mx-auto'>
			<h1 className='text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left'>Settings</h1>
			<form onSubmit={handleSave} className='space-y-4 flex flex-col mb-8'>
				<div>
					<label className='block mb-1 font-medium'>Name</label>
					<Input value={name} onChange={e => setName(e.target.value)} required />
				</div>
				<div>
					<label className='block mb-1 font-medium'>Email</label>
					<Input value={email} onChange={e => setEmail(e.target.value)} required type='email' />
				</div>
				<Button type='submit' disabled={saving} className='w-full sm:w-auto'>
					{saving ? 'Saving...' : 'Save Changes'}
				</Button>
			</form>

			{/* Password Change Form */}
			<div className='border-t pt-6 mt-6'>
				<h2 className='text-xl font-semibold mb-4'>Change Password</h2>
				<form
					onSubmit={async e => {
						e.preventDefault()
						if (newPassword !== confirmPassword) {
							toast({
								title: 'New passwords do not match',
								description: 'Please re-enter your new password.',
								variant: 'destructive',
							})
							return
						}
						setChangingPassword(true)
						const res = await fetch('/api/users/change-password', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
							body: JSON.stringify({ oldPassword, newPassword }),
						})
						if (res.ok) {
							toast({ title: 'Password changed', description: 'Your password has been changed.' })
							setOldPassword('')
							setNewPassword('')
							setConfirmPassword('')
						} else {
							const data = await res.json().catch(() => ({}))
							toast({
								title: 'Failed to change password',
								description: data.message || 'An error occurred.',
								variant: 'destructive',
							})
						}
						setChangingPassword(false)
					}}
					className='space-y-4 flex flex-col'
				>
					<div>
						<label className='block mb-1 font-medium'>Current Password</label>
						<Input value={oldPassword} onChange={e => setOldPassword(e.target.value)} type='password' required />
					</div>
					<div>
						<label className='block mb-1 font-medium'>New Password</label>
						<Input value={newPassword} onChange={e => setNewPassword(e.target.value)} type='password' required />
					</div>
					<div>
						<label className='block mb-1 font-medium'>Confirm New Password</label>
						<Input
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							type='password'
							required
						/>
					</div>
					<Button type='submit' disabled={changingPassword} className='w-full sm:w-auto'>
						{changingPassword ? 'Changing...' : 'Change Password'}
					</Button>
				</form>
			</div>
		</div>
	)
}

export default Settings
