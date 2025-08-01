import { Module } from '@nestjs/common'
import { StudentController } from 'src/routes/student/student.controller'
import { StudentRepo } from 'src/routes/student/student.repo'
import { StudentService } from 'src/routes/student/student.service'

@Module({
  controllers: [StudentController],
  providers: [StudentRepo, StudentService]
})
export class StudentModule {}
