export async function POST() {
    const response = Response.json({ success: true });
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    response.headers.append(
        'Set-Cookie',
        `admin_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`
    );
    return response;
}
