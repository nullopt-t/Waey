import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, Model } from "mongoose";

import { Assessment } from "../schemas/assessment.schema";
import { AssessmentQuestion } from "../schemas/assessment-question.schema";
import { AssessmentAttempt } from "../schemas/assessment-attempt.schema";
import { CreateAssessmentDto, SubmitAssessmentDto } from "../dto/assessment.dto";

@Injectable()
export class AssessmentService {
  constructor(
    @InjectModel(Assessment.name)
    private assessmentModel: Model<Assessment>,

    @InjectModel(AssessmentQuestion.name)
    private questionModel: Model<AssessmentQuestion>,

    @InjectModel(AssessmentAttempt.name)
    private attemptModel: Model<AssessmentAttempt>,
  ) { }

  async create(dto: CreateAssessmentDto) {
    const assessment = await this.assessmentModel.create({
      title: dto.title,
      description: dto.description,
      results: dto.results,
    });

    const questions = dto.questions.map((q, index) => ({
      assessmentId: assessment._id,
      text: q.text,
      order: index,
      options: q.options,
    }));

    await this.questionModel.insertMany(questions);

    return {
      assessmentId: assessment._id,
      message: "Assessment created successfully",
    };
  }

  async findAll() {
    return this.assessmentModel.find({}, {
      title: 1,
      description: 1,
    });
  }

  async findOne(id: string) {
    const assessment = await this.assessmentModel.findById(id);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    const questions = await this.questionModel
      .find({ assessmentId: new Types.ObjectId(id) })
      .sort({ order: 1 });

    return {
      ...assessment.toObject(),
      questions,
    };
  }

  async submit(userId: string, dto: SubmitAssessmentDto) {
    const assessment = await this.assessmentModel.findById(dto.assessmentId);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    let totalScore = 0;

    for (const ans of dto.answers) {
      totalScore += ans.score;
    }

    const result = assessment.results.find(
      (r) =>
        totalScore >= r.minScore &&
        totalScore <= r.maxScore,
    );

    if (!result) {
      throw new NotFoundException("No matching result");
    }

    return {
      score: totalScore,
      result: {
        title: result.title,
        description: result.description,
      },
    };
  }
}
