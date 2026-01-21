import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from './storage.service';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Query('folder') folder: string = 'attachments',
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.storageService.uploadFile(file, folder);
    return {
      success: true,
      ...result,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  @Post('delete')
  async deleteFile(@Body('key') key: string) {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    await this.storageService.deleteFile(key);
    return { success: true, message: 'File deleted successfully' };
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn: number = 3600,
  ) {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    const url = await this.storageService.getSignedUrl(key, expiresIn);
    return { success: true, url };
  }

  @Get('metadata/:key')
  async getFileMetadata(@Param('key') key: string) {
    const metadata = await this.storageService.getFileMetadata(key);
    return { success: true, metadata };
  }
}
