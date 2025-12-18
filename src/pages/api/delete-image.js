import { deleteImageFromS3 } from '@/lib/firebase/storage/uploadImage';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { url } = req.body;
  try {
    await deleteImageFromS3(url);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}