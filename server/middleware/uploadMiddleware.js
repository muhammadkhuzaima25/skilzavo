import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skilzavo/services',
    allowed_formats: ['jpg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 5);
