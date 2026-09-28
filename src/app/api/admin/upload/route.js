export const dynamic = 'force-dynamic';

import { writeFile, mkdir } from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import { verifyAdmin } from '../../../../lib/auth';

const MAX_SIZE = 20 * 1024 * 1024;

function detectAllowedType(buffer) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png';
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return '.webp';
    if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') return '.mp4';
    return null;
}

export async function POST(request) {
    const admin = verifyAdmin(request);
    if (!admin) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || typeof file.arrayBuffer !== 'function') return Response.json({ error: 'Dosya yok' }, { status: 400 });

        // Boyut kontrolü
        if (file.size <= 0 || file.size > MAX_SIZE) {
            return Response.json({
                error: 'Dosya boş veya çok büyük. Maksimum 20 MB.'
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = detectAllowedType(buffer);
        if (!ext) return Response.json({ error: 'Dosya içeriği desteklenen JPEG, PNG, WebP veya MP4 türünde değil' }, { status: 400 });

        const filename = `${crypto.randomUUID()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        console.log('✅ Dosya yüklendi:', filename, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        return Response.json({ url: `/uploads/${filename}`, size: file.size });
    } catch (error) {
        console.error('UPLOAD ERROR:', error);
        return Response.json({ error: 'Yüklenemedi' }, { status: 500 });
    }
}
