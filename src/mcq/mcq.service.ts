import {
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMcqDto } from './dto/create-mcq.dto';
import { UpdateMcqDto } from './dto/update-mcq.dto';
import { Mcq } from './entities/mcq.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReturnData } from 'src/utils/globalValues';

@Injectable()
export class McqService {
  constructor(
    @InjectRepository(Mcq)
    private readonly mcqRepository: Repository<Mcq>,
  ) {}

  async create(createMcqDto: CreateMcqDto) {
    const returnData = new ReturnData();

    try {
      const mcq = await this.mcqRepository.save(createMcqDto);
      if (!mcq) {
        returnData.error = true;
        returnData.message = 'MCQ not created';
        return returnData;
        // throw new MisdirectedException('MCQ not created');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = mcq;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();

    try {
      const mcqs = await this.mcqRepository.find();
      if (mcqs.length === 0) {
        returnData.error = true;
        returnData.message = "No MCQ's found";
        return returnData;
        // throw new NotFoundException("No MCQ's found");
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = mcqs;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();

    try {
      const mcq = await this.mcqRepository.findOneBy({ questionId: id });
      if (!mcq) {
        returnData.error = true;
        returnData.message = 'No MCQ found for the given QuestionId';
        return returnData;
        // throw new NotFoundException('No MCQ found for the given QuestionId');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = mcq;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async update(id: number, updateMcqDto: UpdateMcqDto) {
    const returnData = new ReturnData();

    try {
      const updatedMcq = await this.mcqRepository.update(id, updateMcqDto);
      if (!updatedMcq.affected) {
        returnData.error = true;
        returnData.message = 'MCQ not updated';
        return returnData;
        // throw new MisdirectedException('MCQ not updated');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedMcq.affected };
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();

    try {
      const deletedMcq = await this.mcqRepository.delete(id);
      if (!deletedMcq.affected) {
        returnData.error = true;
        returnData.message = 'MCQ not deleted';
        return returnData;
        // throw new MisdirectedException('MCQ not deleted');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: deletedMcq.affected };
      return returnData;
    } catch (error) {
      throw error;
    }
  }
}
