import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  Res,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  private readonly uploadPath: string;

  constructor(
    private configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get('UPLOAD_PATH', './data/uploads/posts');
  }

  // Upload multiple images (for posts)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './data/uploads/posts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          cb(null, `post-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files are allowed'), false);
          return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
          cb(new Error('Invalid image type. Allowed: JPEG, PNG, WebP, GIF'), false);
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const result = {
      files: files.map(file => ({
        url: `/uploads/posts/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      })),
    };

    return result;
  }

  // Upload article cover image
  @Post('article-cover')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './data/uploads/articles',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          cb(null, `article-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files are allowed'), false);
          return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
          cb(new Error('Invalid image type. Allowed: JPEG, PNG, WebP, GIF'), false);
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadArticleCover(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const apiUrl = this.configService.get('API_URL', 'http://localhost:4000');

    return {
      success: true,
      url: `/uploads/articles/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // Serve uploaded images
  @Get('article-cover/:filename')
  getArticleCover(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(__dirname, '../../data/uploads/articles', filename);
    res.sendFile(filePath);
  }
}
