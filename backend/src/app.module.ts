import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { TherapistModule } from './therapist/therapist.module';
import { CommunityModule } from './community/community.module';
import { UploadModule } from './upload/upload.module';
import { ArticleModule } from './article/article.module';
import { FutureMessageModule } from './future-message/future-message.module';
import { ChatModule } from './chat/chat.module';
import { VideoModule } from './video/video.module';
import { CommentModule } from './comment/comment.module';
import { StoryModule } from './story/story.module';
import { BookModule } from './book/book.module';
import { FeedbackModule } from './feedback/feedback.module';
import { NotificationModule } from './notification/notification.module';
import { MedicalContactModule } from './medical-contact/medical-contact.module';
import { JourneyModule } from './journey/journey.module';
import { AssessmentModule } from "./assessments/assessments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
      ignoreEnvFile: false,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        if (!dbUrl) {
          Logger.error('DATABASE_URL environment variable is not set', 'AppModule');
          throw new Error('DATABASE_URL is required');
        }
        Logger.log(`Connecting to database: ${dbUrl.substring(0, dbUrl.indexOf('@'))}@...`, 'AppModule');
        return {
          uri: dbUrl,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
          minPoolSize: 5,
          connectTimeoutMS: 10000,
          retryWrites: true,
          retryReads: true,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [{
        ttl: configService.get<number>('THROTTLE_TTL') || 60000,
        limit: configService.get<number>('THROTTLE_LIMIT') || 10,
      }],
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    HealthModule,
    TherapistModule,
    CommunityModule,
    UploadModule,
    ArticleModule,
    FutureMessageModule,
    ChatModule,
    VideoModule,
    CommentModule,
    StoryModule,
    BookModule,
    FeedbackModule,
    NotificationModule,
    MedicalContactModule,
    JourneyModule,
    AssessmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
