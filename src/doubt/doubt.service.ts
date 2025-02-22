import {
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoubtDto } from './dto/create-doubt.dto';
import { UpdateDoubtDto } from './dto/update-doubt.dto';
import { Users } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Doubt } from './entities/doubt.entity';
import { Repository } from 'typeorm';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ReturnData } from 'src/utils/globalValues';

@Injectable()
export class DoubtService {
  constructor(
    @InjectRepository(Doubt)
    private readonly doubtService: Repository<Doubt>,
  ) {}

  async create(createDoubtDto: CreateDoubtDto, user: Users) {
    const returnData = new ReturnData();
    createDoubtDto.userId = user.id;
    try {
      const doubt = await this.doubtService.save(createDoubtDto);
      if (!doubt) {
        returnData.error = true;
        returnData.message = 'Doubt not created';
        return returnData;
        // throw new MisdirectedException('Doubt not created');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = doubt;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();
    try {
      const doubts = await this.doubtService.find();
      if (doubts.length === 0) {
        returnData.error = true;
        returnData.message = 'No doubts found';
        return returnData;
        // throw new NotFoundException('No doubts found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = doubts;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();
    try {
      const doubt = await this.doubtService.findOneBy({ doubtId: id });
      if (!doubt) {
        returnData.error = true;
        returnData.message = 'No doubt found for this Doubt Id';
        return returnData;
        // throw new NotFoundException('No doubt found for this Doubt Id');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = doubt;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async response(id: number, updateResponseDto: UpdateResponseDto) {
    const returnData = new ReturnData();

    try {
      const response = await this.doubtService.update(id, {
        ...updateResponseDto,
        isCleared: true,
      });
      if (!response) {
        returnData.error = true;
        returnData.message = "Response didn't updated for the Doubt";
        return returnData;
        // throw new NotFoundException("Response didn't updated for the Doubt");
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = response;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByInstructor(id: number) {
    const returnData = new ReturnData();

    try {
      const doubts = await this.doubtService.findBy({ instructorId: id });
      if (doubts.length === 0) {
        returnData.error = true;
        returnData.message = 'No doubts found for this Instructor';
        return returnData;
        // throw new NotFoundException('No doubts found for this Instructor');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = doubts;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByStudent(id: number) {
    const returnData = new ReturnData();

    try {
      const doubts = await this.doubtService.findBy({ userId: id });
      if (doubts.length === 0) {
        returnData.error = true;
        returnData.message = 'No doubts found for this Student';
        return returnData;
        // throw new NotFoundException('No doubts found for this Student');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = doubts;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByLesson(id: number) {
    const returnData = new ReturnData();

    try {
      const doubts = await this.doubtService.findBy({ lessonId: id });
      if (doubts.length === 0) {
        returnData.error = true;
        returnData.message = 'No doubts found for this Student';
        return returnData;
        // throw new NotFoundException('No doubts found for this Lesson Id');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = doubts;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateDoubtDto: UpdateDoubtDto) {
    const returnData = new ReturnData();

    try {
      const updatedDoubt = await this.doubtService.update(id, updateDoubtDto);
      if (!updatedDoubt) {
        returnData.error = true;
        returnData.message = 'Doubt not updated';
        return returnData;
        // throw new MisdirectedException('Doubt not updated');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedDoubt.affected };
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();

    try {
      const deletedDoubt = await this.doubtService.delete(id);
      if (!deletedDoubt) {
        returnData.error = true;
        returnData.message = 'Doubt not deleted';
        return returnData;
        // throw new MisdirectedException('Doubt not deleted');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: deletedDoubt.affected };
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
