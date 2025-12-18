import { uploadFileToS3 } from '@/lib/firebase/storage/uploadFileToS3';

export async function POST(req) {
  try {
    const body = await req.json();
    const { buffer, originalFileName, folderName,userId } = body;

    if (!buffer || !originalFileName || !folderName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const fileBuffer = Buffer.from(buffer, 'base64');
    const url = await uploadFileToS3(fileBuffer, originalFileName, 'text/csv', folderName,userId);

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
