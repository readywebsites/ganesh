import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'surat_ganesh_mahotsav_secret_key_2026_super_secure';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getAdminFromRequest(req) {
  try {
    let token = null;
    
    // Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies
    if (!token && req.cookies) {
      const cookieToken = req.cookies.get('admin_token');
      if (cookieToken) {
        token = cookieToken.value || cookieToken;
      }
    }

    if (!token) return null;

    return verifyToken(token);
  } catch (err) {
    return null;
  }
}
