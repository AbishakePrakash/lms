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

@Injectable()
export class McqService {
  constructor(
    @InjectRepository(Mcq)
    private readonly mcqRepository: Repository<Mcq>,
  ) {}
  async create(createMcqDto: CreateMcqDto) {
    try {
      const mcq = await this.mcqRepository.save(createMcqDto);
      if (!mcq) {
        throw new MisdirectedException('MCQ not created');
      }
      return mcq;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const mcqs = await this.mcqRepository.find();
      if (mcqs.length === 0) {
        throw new NotFoundException("No MCQ's found");
      }
      return mcqs;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const mcq = await this.mcqRepository.findOneBy({ questionId: id });
      if (!mcq) {
        throw new NotFoundException('No MCQ found for the given QuestionId');
      }
      return mcq;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateMcqDto: UpdateMcqDto) {
    try {
      const updatedMcq = await this.mcqRepository.update(id, updateMcqDto);
      if (!updatedMcq.affected) {
        throw new MisdirectedException('MCQ not updated');
      }
      return updatedMcq;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deletedMcq = await this.mcqRepository.delete(id);
      if (!deletedMcq.affected) {
        throw new MisdirectedException('MCQ not deleted');
      }
      return deletedMcq;
    } catch (error) {
      throw error;
    }
  }
}
