import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, Model } from "mongoose";

import { Assessment } from "../schemas/assessment.schema";
import { AssessmentQuestion } from "../schemas/assessment-question.schema";
import { AssessmentAttempt } from "../schemas/assessment-attempt.schema";
import { CreateAssessmentDto, SubmitAssessmentDto, UpdateAssessmentDto, CreateQuestionDto } from "../dto/assessment.dto";

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
    return this.assessmentModel.find({ isPublished: true }, {
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
      .find({ assessmentId: id })
      .sort({ order: 1 });

    return {
      ...assessment.toObject(),
      questions,
    };
  }

  async submit(userId: string, dto: SubmitAssessmentDto) {
    const assessment = await this.assessmentModel.findById(dto.assessmentId);

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const questions = await this.questionModel.find({
      assessmentId: dto.assessmentId,
    });

    // map questions for fast lookup
    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q]),
    );

    let totalScore = 0;
    for (const answer of dto.answers) {
      const question = await this.questionModel.findById(answer.questionId);
      const option = question.options.id(answer.optionId);
      if (!option) {
        throw new BadRequestException("Invalid option");
      }

      totalScore += option.score;
    }

    const result = assessment.results.find(
      (r) =>
        totalScore >= r.minScore &&
        totalScore <= r.maxScore,
    );

    if (!result) {
      throw new NotFoundException('No matching result');
    }

    // save attempt
    await this.attemptModel.create({
      userId,
      assessmentId: dto.assessmentId,
      answers: dto.answers,
      totalScore,
      resultTitle: result.title,
      resultDescription: result.description,
    });

    return {
      score: totalScore,
      result: {
        title: result.title,
        description: result.description,
      },
    };
  }

  async togglePublish(id: string, isPublished: boolean) {
    const assessment = await this.assessmentModel.findById(id);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    assessment.isPublished = isPublished;

    await assessment.save();

    return {
      id: assessment._id,
      isPublished: assessment.isPublished,
    };
  }

  async update(id: string, dto: UpdateAssessmentDto) {
    const updated = await this.assessmentModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );

    if (!updated) throw new NotFoundException();

    const questions = await this.questionModel
      .find({ assessmentId: id })
      .sort({ order: 1 });

    return {
      ...updated.toObject(),
      questions,
    };
  }

  async addQuestion(assessmentId: string, dto: CreateQuestionDto) {
    const assessment = await this.assessmentModel.findById(assessmentId);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    const question = await this.questionModel.create({
      assessmentId,
      ...dto,
    });

    return question;
  }

  async getAttempts(userId: string) {
    return this.attemptModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate("assessmentId", "title description");
  }

  async removeAssessment(id: string) {
    const assessment = await this.assessmentModel.findById(id);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    // 🧹 delete related questions
    await this.questionModel.deleteMany({ assessmentId: id });

    // 🧹 delete attempts
    await this.attemptModel.deleteMany({ assessmentId: id });

    // 🧨 delete assessment itself
    await this.assessmentModel.findByIdAndDelete(id);

    return {
      success: true,
      message: "Assessment deleted",
    };
  }

  async removeQuestion(id: string) {
    const question = await this.questionModel.findById(id);

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    await this.questionModel.findByIdAndDelete(id);

    return {
      success: true,
      message: "Question deleted",
    };
  }

  async getAssessmentAttempts(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    const attempts = await this.attemptModel
      .find({ assessmentId })
      .populate("userId", "email name") // optional but very useful
      .sort({ createdAt: -1 });

    return {
      assessmentId,
      totalAttempts: attempts.length,
      attempts,
    };
  }
}
