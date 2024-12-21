import {
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Chapter } from 'src/chapter/entities/chapter.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: Users) {
    createCourseDto.author = user.username;
    createCourseDto.authorId = user.id;
    createCourseDto.courseStatus = 1;
    try {
      const course = await this.courseRepository.save(createCourseDto);
      if (!course) {
        throw new MisdirectedException('Course not created. Try Again');
      }
      return course;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async approveCourse(id: number, user: Users) {
    const updateCourseDto: UpdateCourseDto = {
      approver: user.username,
      approverId: user.id,
      courseStatus: 2,
    };
    try {
      const approval = await this.courseRepository.update(id, updateCourseDto);
      if (!approval) {
        throw new MisdirectedException('Course Approval Failed');
      }
      return { message: 'Course Approved and Published Successfully' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    try {
      const courses = await this.courseRepository.find({
        where: { courseStatus: 2 },
      });
      if (courses.length === 0) {
        throw new NotFoundException('No courses Found');
      }
      return courses;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const course = await this.courseRepository.findOneBy({ courseId: id });
      if (!course) {
        throw new NotFoundException('No course Found for this Id');
      }
      const chapters = await this.chapterRepository.findBy({ courseId: id });

      return { ...course, chapters: chapters };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const updateCourse = await this.courseRepository.update(
        id,
        updateCourseDto,
      );
      if (updateCourse.affected && updateCourse.affected === 0) {
        throw new MisdirectedException('No updated done. Try again');
      }
      return { updatedRows: updateCourse.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async suspend(id: number) {
    const updateCourseDto: UpdateCourseDto = {
      courseStatus: 3,
    };
    try {
      const suspendCourse = await this.courseRepository.update(
        id,
        updateCourseDto,
      );
      if (suspendCourse.affected && suspendCourse.affected === 0) {
        throw new MisdirectedException('Course Suspension failed');
      }
      return { suspendedRows: suspendCourse.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deleteCourse = await this.courseRepository.delete(id);
      if (deleteCourse.affected && deleteCourse.affected === 0) {
        throw new MisdirectedException('No deletion done. Try again');
      }
      return { deletedRows: deleteCourse.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
