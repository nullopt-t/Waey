import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AssessmentController } from "./controllers/assessment.controller";
import { AssessmentService } from "./services/assessment.service";

import {
  Assessment,
  AssessmentSchema,
} from "./schemas/assessment.schema";

import {
  AssessmentQuestion,
  AssessmentQuestionSchema,
} from "./schemas/assessment-question.schema";

import {
  AssessmentAttempt,
  AssessmentAttemptSchema,
} from "./schemas/assessment-attempt.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: AssessmentQuestion.name, schema: AssessmentQuestionSchema },
      { name: AssessmentAttempt.name, schema: AssessmentAttemptSchema },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule { }
