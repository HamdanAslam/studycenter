import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const Login = () => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const { login } = useAuth()
	const { toast } = useToast()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			await login(username, password)
			toast({
				title: 'Login successful',
				description: 'Welcome to Studycenter!',
			})
		} catch (error: any) {
			toast({
				title: 'Login failed',
				description: error?.message || 'Please check your credentials and try again.',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-background p-2 sm:p-4'>
			<div className='w-full max-w-xs sm:max-w-md mx-auto'>
				<div className='text-center mb-8'>
					<div className='flex items-center justify-center mb-4'>
						<GraduationCap className='h-12 w-12 text-primary' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-foreground'>Studycenter</h1>
					<p className='text-muted-foreground mt-2'>Manage your study center efficiently</p>
				</div>

				<Card className='bg-card border border-border shadow-md'>
					<CardHeader>
						<CardTitle>Sign In</CardTitle>
						<CardDescription>Enter your credentials to access the dashboard</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='username'>Username</Label>
								<Input
									id='username'
									type='text'
									placeholder='admin@studycenter.com'
									value={username}
									onChange={e => setUsername(e.target.value)}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									placeholder='Enter your password'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
								/>
							</div>
							<Button type='submit' className='w-full' disabled={loading}>
								{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Sign In
							</Button>
						</form>

						{/* Demo credentials removed */}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
