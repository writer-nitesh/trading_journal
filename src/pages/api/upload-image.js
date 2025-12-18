import { uploadImageToS3 } from '@/lib/firebase/storage/uploadImage';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { buffer, originalFileName, contentType, folderName } = req.body;
  try {
    const buf = new Uint8Array(Buffer.from(buffer, 'base64'));
    const url = await uploadImageToS3(buf, originalFileName, contentType, folderName);
    res.status(200).json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}