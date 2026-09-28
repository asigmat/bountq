import jwt from 'jsonwebtoken';

export function verifyAdmin(request) {
    const cookieToken = request.headers.get('cookie')
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('admin_token='))
        ?.slice('admin_token='.length);
    const token = cookieToken ? decodeURIComponent(cookieToken) : null;
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}
