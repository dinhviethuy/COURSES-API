import { Module } from '@nestjs/common'
import { ProfileController } from 'src/routes/profile/profile.controller'
import { ProfileRepo } from 'src/routes/profile/profile.repo'
import { ProfileService } from 'src/routes/profile/profile.service'

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepo]
})
export class ProfileModule {}
