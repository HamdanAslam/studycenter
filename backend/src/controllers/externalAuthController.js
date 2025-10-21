import jwt from 'jsonwebtoken'

// Admin-only endpoint to issue external bearer tokens for integrations.
// Expects JSON body: { scopes: ['read'] | ['read','write'], expiresIn: '1h' }
export const issueExternalToken = async (req, res) => {
	try {
		// req.user should be present and is admin (we'll rely on existing admin middleware when mounting the route)
		const { scopes = ['read'], expiresIn = '1h' } = req.body || {}
		if (!Array.isArray(scopes) || scopes.length === 0) {
			return res.status(400).json({ message: 'scopes must be a non-empty array' })
		}

		const secret = process.env.EXTERNAL_JWT_SECRET || process.env.JWT_SECRET
		if (!secret) return res.status(500).json({ message: 'Server misconfiguration: missing JWT secret' })

		const payload = {
			scopes,
			issuedBy: req.user ? req.user._id || req.user.id || req.user.email || 'admin' : 'admin',
		}

		const token = jwt.sign(payload, secret, { expiresIn })
		res.json({ token, expiresIn })
	} catch (err) {
		console.error('issueExternalToken error:', err)
		res.status(500).json({ message: 'Server error' })
	}
}
