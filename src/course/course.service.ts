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
import { ReturnData } from 'src/utils/globalValues';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: Users) {
    const returnData = new ReturnData();
    createCourseDto.author = user.username;
    createCourseDto.authorId = user.id;
    createCourseDto.courseStatus = 1;
    try {
      const course = await this.courseRepository.save(createCourseDto);
      if (!course) {
        returnData.error = true;
        returnData.message = 'Course not created. Try Again';
        return returnData;
        // throw new MisdirectedException('Course not created. Try Again');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = course;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async approveCourse(id: number, user: Users) {
    const returnData = new ReturnData();
    const updateCourseDto: UpdateCourseDto = {
      approver: user.username,
      approverId: user.id,
      courseStatus: 2,
    };
    try {
      const approval = await this.courseRepository.update(id, updateCourseDto);
      if (!approval) {
        returnData.error = true;
        returnData.message = 'Course Approval Failed';
        return returnData;
        // throw new MisdirectedException('Course Approval Failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();
    try {
      const courses = await this.courseRepository.find({
        where: { courseStatus: 2 },
      });
      if (courses.length === 0) {
        returnData.error = true;
        returnData.message = 'No courses Found';
        return returnData;
        // throw new NotFoundException('No courses Found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = courses;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();
    try {
      const course = await this.courseRepository.findOneBy({ courseId: id });
      if (!course) {
        returnData.error = true;
        returnData.message = 'No course Found for this Id';
        return returnData;
        // throw new NotFoundException('No course Found for this Id');
      }
      const chapters = await this.chapterRepository.findBy({ courseId: id });

      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { ...course, chapters: chapters };
      return returnData;
      // return { ...course, chapters: chapters };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const returnData = new ReturnData();
    try {
      const updateCourse = await this.courseRepository.update(
        id,
        updateCourseDto,
      );
      if (updateCourse.affected && updateCourse.affected === 0) {
        returnData.error = true;
        returnData.message = 'No updated done. Try again';
        return returnData;
        // throw new MisdirectedException('No updated done. Try again');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updateCourse.affected };
      return returnData;
      // return { updatedRows: updateCourse.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async suspend(id: number) {
    const returnData = new ReturnData();

    const updateCourseDto: UpdateCourseDto = {
      courseStatus: 3,
    };
    try {
      const suspendCourse = await this.courseRepository.update(
        id,
        updateCourseDto,
      );
      if (suspendCourse.affected && suspendCourse.affected === 0) {
        returnData.error = true;
        returnData.message = 'No updated done. Try again';
        return returnData;
        // throw new MisdirectedException('Course Suspension failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { suspendedRows: suspendCourse.affected };
      return returnData;
      // return { suspendedRows: suspendCourse.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();
    try {
      const deleteCourse = await this.courseRepository.delete(id);
      if (deleteCourse.affected && deleteCourse.affected === 0) {
        returnData.error = true;
        returnData.message = 'Course deletion failed';
        return returnData;
        // throw new MisdirectedException('No deletion done. Try again');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { deletedRows: deleteCourse.affected };
      return returnData;
      // return { deletedRows: deleteCourse.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
