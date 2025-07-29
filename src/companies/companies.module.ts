import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from './services/companies.service';
import { CompaniesController } from './controllers/companies.controller';
import { Company, CompanySchema } from './entities/company.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, EmailService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
