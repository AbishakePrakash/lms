import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Client, ID, Storage } from 'appwrite';
import { Express } from 'express';
import { uploadToS3 } from 'src/utils/awsBucket';
import { contains } from 'class-validator';

@Injectable()
export class UploadService {
  async createFile(file: Express.Multer.File) {
    try {
      const { buffer, originalname, mimetype } = file;

      // console.log({
      //   buffer: buffer,
      //   originalname: originalname,
      //   mimetype: mimetype,
      // });

      if (/[A-Z\s]/.test(originalname)) {
        console.log({
          originalname: originalname,
          mimetype: mimetype,
        });
        throw new BadRequestException(
          'File name should not contain spaces or capital letters',
        );
      }

      const s3Url = await uploadToS3(buffer, originalname, mimetype);

      console.log('File uploaded:', s3Url);
      return s3Url;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      return 'File upload failed!';
    }
  }

  async findAll() {
    return `This action returns all upload`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  async update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  async remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}
