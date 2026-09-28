export const dynamic = 'force-dynamic';

import { verifyAdmin } from '../../../../lib/auth';

export async function GET(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });
    return Response.json({ valid: true, admin: { email: admin.email } });
}