import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { RegisterUserDto, RegisterTherapistDto, UpdateUserDto } from '../auth/dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { BadRequestException } from '@nestjs/common';
import { multerConfig } from '../modules/upload/multer.config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('المستخدمين')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @ApiOperation({ summary: 'عرض مستخدم بالرقم' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    return this.userService.findById(id);
  }

  @ApiOperation({ summary: 'عرض جميع المستخدمين' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<{ users: Omit<User, 'password'>[]; total: number }> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'تحديث مستخدم (PUT)' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<Omit<User, 'password'>> {
    // Create a copy of the DTO with proper typing for the service
    const updateData: Partial<User> = {};

    // Copy each field individually to handle type conversions
    Object.keys(updateUserDto).forEach(key => {
      if (key === 'birthDate' && updateUserDto[key] && typeof updateUserDto[key] === 'string') {
        const dateValue = new Date(updateUserDto[key]);
        if (!isNaN(dateValue.getTime())) {
          updateData[key] = dateValue;
        } else {
          throw new BadRequestException('Invalid date format for birthDate');
        }
      } else if (updateUserDto[key] !== undefined) {
        updateData[key] = updateUserDto[key];
      }
    });

    return this.userService.update(id, updateData);
  }

  @ApiOperation({ summary: 'تحديث جزئي لمستخدم' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async patch(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<Omit<User, 'password'>> {
    // Same as PUT but allows partial updates
    const updateData: Partial<User> = {};

    Object.keys(updateUserDto).forEach(key => {
      if (key === 'birthDate' && updateUserDto[key] && typeof updateUserDto[key] === 'string') {
        const dateValue = new Date(updateUserDto[key]);
        if (!isNaN(dateValue.getTime())) {
          updateData[key] = dateValue;
        } else {
          throw new BadRequestException('Invalid date format for birthDate');
        }
      } else if (updateUserDto[key] !== undefined) {
        updateData[key] = updateUserDto[key];
      }
    });

    return this.userService.update(id, updateData);
  }


  @ApiOperation({ summary: 'حذف مستخدم' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Request() req, @Param('id') id: string): Promise<void> {
    return this.userService.delete(id, req.user.userId);
  }

  @ApiOperation({ summary: 'رفع صورة الملف الشخصي' })
  @ApiOkResponse({ description: 'تم بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'ملف غير صالح' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post(':id/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('avatar', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const uploadPath = './data/uploads/avatars';
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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Create avatar URL path
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // Update user with avatar URL
    await this.userService.update(id, { avatar: avatarUrl });

    return {
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl,
    };
  }
}