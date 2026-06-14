import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// File upload configuration
export const multerConfig = {
  // File size limit: 5MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  // File filter - only allow images
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  // Storage configuration
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = './data/uploads/avatars';

      // Create directory if it doesn't exist
      try {
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
      } catch (err) {
        // Handle the error
        cb(err, false);
        return;
      }

      cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
      // Generate unique filename: timestamp-randomstring.extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
};

// File upload for single image (avatar)
export const uploadAvatar = {
  ...multerConfig,
  limits: {
    ...multerConfig.limits,
  },
};
