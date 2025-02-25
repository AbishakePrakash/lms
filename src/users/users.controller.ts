import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { VerifyAccountPayload } from 'src/otp/dto/verifyAccount.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guard/adminGuard';
import { AuthGuard } from 'src/auth/guard/authguard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReturnData } from 'src/utils/globalValues';

@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Post('verifyAccountV0')
  // verifyAccount(@Body() payload: VerifyAccountPayload) {
  //   return this.usersService.setAsActive(payload);
  // }

  // @Get('v0')
  // @UseGuards(AuthGuard)
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get('v0/:id')
  // @UseGuards(AdminGuard)
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @Post()
  createV2(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createV2(createUserDto);
  }

  @Post('verifyAccount')
  verifyAccountV2(@Body() payload: VerifyAccountPayload) {
    return this.usersService.verifyAccountV2(payload);
  }
  @Get()
  @UseGuards(AuthGuard)
  findAllV2() {
    return this.usersService.findAllV2();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOneV2(@Param('id') id: string) {
    return this.usersService.findOneV2(+id);
  }

  @Get('profile')
  @UseGuards(AdminGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('assign/:id')
  @UseGuards(AdminGuard)
  assign(@Param('id') id: string) {
    return this.usersService.assign(+id);
  }

  @Post('image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // This defines the file type for Swagger
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const returnData = new ReturnData();
    if (!file) {
      returnData.error = true;
      returnData.message = 'No file uploaded';
      return returnData;
      // throw new BadRequestException('No file uploaded');
    }
    return await this.usersService.uploadFile(file, req.user);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
