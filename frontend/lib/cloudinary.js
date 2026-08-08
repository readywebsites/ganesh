import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export async function uploadToCloudinary(fileBuffer, folder = 'ganesh-mahotsav', filename = '') {
  // If Cloudinary keys are configured, use Cloudinary
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            resource_type: result.resource_type,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Fallback to local storage if Cloudinary is not configured
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = filename ? path.extname(filename) : '.png';
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    url: `/uploads/${uniqueName}`,
    public_id: `local_${uniqueName}`,
    format: ext.replace('.', ''),
    bytes: fileBuffer.length,
    resource_type: 'image',
  };
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;

  if (publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Error deleting local file:', err);
      }
    }
    return;
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Cloudinary destroy error:', err);
    }
  }
}

export default cloudinary;
