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

@Injectable()
export class DoubtService {
  constructor(
    @InjectRepository(Doubt)
    private readonly doubtService: Repository<Doubt>,
  ) {}
  async create(createDoubtDto: CreateDoubtDto, user: Users) {
    createDoubtDto.userId = user.id;
    try {
      const doubt = await this.doubtService.save(createDoubtDto);
      if (!doubt) {
        throw new MisdirectedException('Doubt not created');
      }
      return doubt;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const doubts = await this.doubtService.find();
      if (doubts.length === 0) {
        throw new NotFoundException('No doubts found');
      }
      return doubts;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const doubt = await this.doubtService.findOneBy({ doubtId: id });
      if (!doubt) {
        throw new NotFoundException('No doubt found for this Doubt Id');
      }
      return doubt;
    } catch (error) {
      throw error;
    }
  }

  async findByInstructor(id: number) {
    try {
      const doubts = await this.doubtService.findBy({ instructorId: id });
      if (doubts.length === 0) {
        throw new NotFoundException('No doubts found for this Instructor');
      }
      return doubts;
    } catch (error) {
      throw error;
    }
  }

  async findByStudent(id: number) {
    try {
      const doubts = await this.doubtService.findBy({ userId: id });
      if (doubts.length === 0) {
        throw new NotFoundException('No doubts found for this Student');
      }
      return doubts;
    } catch (error) {
      throw error;
    }
  }

  async findByLesson(id: number) {
    try {
      const doubts = await this.doubtService.findBy({ lessonId: id });
      if (doubts.length === 0) {
        throw new NotFoundException('No doubts found for this Lesson Id');
      }
      return doubts;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDoubtDto: UpdateDoubtDto) {
    try {
      const updatedDoubt = await this.doubtService.update(id, updateDoubtDto);
      if (!updatedDoubt) {
        throw new MisdirectedException('Doubt not updated');
      }
      return updatedDoubt;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deletedDoubt = await this.doubtService.delete(id);
      if (!deletedDoubt) {
        throw new MisdirectedException('Doubt not deleted');
      }
      return deletedDoubt;
    } catch (error) {
      throw error;
    }
  }
}
