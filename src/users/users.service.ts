import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
// import { MailData, ReturnData } from 'src/Utils/globalValues';
import { OtpService } from 'src/otp/otp.service';
import { OtpDto } from 'src/otp/dto/create-otp.dto';
import { VerifyAccountPayload } from 'src/otp/dto/verifyAccount.dto';
import { MailData, ReturnData } from 'src/utils/globalValues';
import triggerMaileEvent from 'src/utils/nodeMailer';

// ... your TypeScript code using bcryptjs
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
    // @Inject(WalletService)
    // private readonly walletService: WalletService,
  ) {}

  async sendMail(mailData: MailData) {
    const returnData = new ReturnData();
    try {
      const data = await triggerMaileEvent(mailData);
      console.log({ data });
      const status = data.split(' ')[0];
      if (status === '250') {
        returnData.message = 'Mail sent successfully';
        returnData.value = data;
        // returnData.value = parseInt(status);
      }
    } catch (error) {
      console.log('Error sending mail: ', error);
      throw new Error('Mail sending failed');
    }
    return returnData;
  }

  generateSixDigitNumber() {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return randomNum;
  }

  async create(createUserDto: CreateUserDto) {
    const returnData = new ReturnData();
    const mailData = new MailData();
    const sender = process.env.MAIL_SENDER;
    const saltRounds = process.env.SALT_ROUNDS;
    console.log({ saltRounds });
    const otp = this.generateSixDigitNumber();

    createUserDto.isActive = false;

    //Check duplicate
    const duplicate = await this.usersRepo.findOneBy({
      email: createUserDto.email,
    });

    if (duplicate) {
      throw new BadRequestException('Email already exists');
    }

    await bcrypt
      .hash(createUserDto.password, parseInt(saltRounds))
      .then((data) => {
        createUserDto.password = data;
      });

    try {
      const data = await this.usersRepo.save(createUserDto);
      if (!data) {
        throw new InternalServerErrorException('User creating process failed');
      }
      const { password, ...user } = data;

      const otpData: OtpDto = {
        userId: user.id,
        email: createUserDto.email,
        otp: otp,
        service: 'VerifyAccount',
      };

      try {
        const verify = await this.otpService.saveOtp(otpData);
        if (!verify) {
          throw new InternalServerErrorException('OTP saving failed');
        }
        try {
          mailData.from = sender;
          mailData.to = createUserDto.email;
          mailData.subject = 'Verify Account';
          mailData.text = `The OTP to verify your CRM Account is ${otp}`;

          await this.sendMail(mailData);
        } catch (error) {
          console.log({ error });
          throw new InternalServerErrorException("OTP didn't sent to user");
        }
      } catch (error) {
        console.log({ error });
      }

      returnData.message = 'User created Successfully';
      returnData.value = user;
    } catch (error) {
      console.log({ error });
    }

    return returnData;
  }

  async setAsActive(payload: VerifyAccountPayload) {
    const returnData = new ReturnData();
    const user = await this.findOneByEmail(payload.email);
    payload.service = 'verifyAccount';
    const verifyOtp = await this.otpService.verifyAccount(payload);
    if (!verifyOtp) {
      throw new UnauthorizedException('Incorrect OTP');
    }

    // Update status
    const updateUser = await this.update(user.id, { isActive: true });

    // Clear OTP's
    const clearOtp = await this.otpService.remove(
      payload.email,
      'VerifyAccount',
    );

    returnData.message = 'User verified successfully';
    returnData.value = user.email;
    return returnData;
  }

  async findAll() {
    const returnData = new ReturnData();
    const data = await this.usersRepo.find();
    if (data.length === 0) {
      throw new NotFoundException('No users found');
    }
    returnData.message = 'Users fetched successfully';
    returnData.value = data;
    return returnData;
  }

  async findOne(id: number) {
    const returnData = new ReturnData();
    const data = await this.usersRepo.findOneBy({ id: id });
    returnData.message = 'User fetched successfully';
    returnData.value = data;
    return returnData;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepo.findOneBy({ email: email });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const returnData = new ReturnData();
    const data = await this.usersRepo.update(id, updateUserDto);
    returnData.message = 'User updated successfully';
    returnData.value = { modifiedRows: data.affected };
    return returnData;
  }

  async remove(id: number) {
    const returnData = new ReturnData();
    const data = await this.usersRepo.delete({ id });
    returnData.message = 'User deleted successfully';
    returnData.value = { modifiedRows: data.affected };
    return returnData;
  }
}
