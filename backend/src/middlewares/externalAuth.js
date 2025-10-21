import jwt from 'jsonwebtoken'

// Middleware to authenticate external Bearer tokens.
// Uses EXTERNAL_JWT_SECRET if set, otherwise falls back to JWT_SECRET.
export function authenticateExternalToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (!token) return res.status(401).json({ message: 'No token provided' })

	const secret = process.env.EXTERNAL_JWT_SECRET || process.env.JWT_SECRET
	if (!secret) return res.status(500).json({ message: 'Server misconfiguration: missing JWT secret' })

	jwt.verify(token, secret, (err, payload) => {
		if (err) return res.status(403).json({ message: 'Invalid token' })
		// attach payload for auditing if needed
		req.external = payload || {}
		next()
	})
}

// Middleware to authorize external token scopes (e.g. 'read', 'write')
export function authorizeExternalScopes(...requiredScopes) {
	return (req, res, next) => {
		const payload = req.external || {}
		const scopes = Array.isArray(payload.scopes) ? payload.scopes : []
		const hasAll = requiredScopes.every(s => scopes.includes(s))
		if (!hasAll) {
			return res.status(403).json({ message: 'Forbidden: missing required scope' })
		}
		next()
	}
}
