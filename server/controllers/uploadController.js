import { getCloudinary, cloudinaryReady } from '../config/cloudinary.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!cloudinaryReady()) throw new HttpError(503, 'Cloudinary is not set up in server/.env.');
  if (!req.file) throw new HttpError(400, 'Choose an image first.');

  const cloudinary = getCloudinary();
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'kabaddi',
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
      (err, out) => (err ? reject(err) : resolve(out))
    );
    stream.end(req.file.buffer);
  });
  res.status(201).json({ url: result.secure_url });
});
