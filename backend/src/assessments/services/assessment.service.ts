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
    const assessments = await this.assessmentModel.find().select(
      'title description isPublished timeLimit passingScore createdAt updatedAt'
    );

    if (assessments.length === 0) return [];

    // ✅ Use raw ObjectId values directly from Mongoose documents
    const ids = assessments.map((a) => a._id);

    console.log('📋 Assessment IDs:', ids);

    const questions = await this.questionModel
      .find({ assessmentId: { $in: ids } })
      .sort({ order: 1 });

    console.log('❓ Questions found:', questions.length);
    console.log('❓ Question assessmentIds:', questions.map((q) => q.assessmentId.toString()));

    // Group by assessmentId string
    const map = new Map<string, any[]>();
    for (const q of questions) {
      const key = q.assessmentId.toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        _id: q._id.toString(),
        text: q.text,
        order: q.order,
        options: q.options.map((o) => ({
          _id: o._id.toString(),
          label: o.label,
          score: o.score,
        })),
      });
    }

    return assessments.map((a) => ({
      _id: a._id.toString(),
      title: a.title,
      description: a.description,
      isPublished: a.isPublished ?? false,
      questions: map.get(a._id.toString()) ?? [],
    }));
  }

  async findOne(id: string) {
    const assessment = await this.assessmentModel.findById(id);

    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    // Explicitly convert string ID to ObjectId for the query
    const questions = await this.questionModel
      .find({ assessmentId: new Types.ObjectId(id) })
      .sort({ order: 1 });

    return {
      ...assessment.toObject(),
      _id: assessment._id.toString(),
      questions: questions.map(q => q.toObject()),
    };
  }

  async submit(userId: string, dto: SubmitAssessmentDto) {
    const assessment = await this.assessmentModel.findById(dto.assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    const questions = await this.questionModel.find({ assessmentId: dto.assessmentId });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let totalScore = 0;
    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue; // Skip invalid questions

      // Find the selected option within the question's options
      const option = question.options.find((opt: any) => opt._id.toString() === answer.optionId);

      if (option) {
        totalScore += option.score;
      } else {
        throw new BadRequestException("Invalid option selected");
      }
    }

    // Calculate max possible score for percentage if needed
    const maxScore = questions.reduce((acc, q) => {
      const maxOptScore = Math.max(...q.options.map((o: any) => o.score));
      return acc + maxOptScore;
    }, 0);

    // Find matching result
    let resultTitle = 'Completed';
    let resultDescription = 'Assessment submitted successfully.';

    if (assessment.results && assessment.results.length > 0) {
      const matchedResult = assessment.results.find(
        (r) => totalScore >= r.minScore && totalScore <= r.maxScore
      );

      if (!matchedResult) {
        // Fallback if score is outside all defined ranges
        resultTitle = 'Ungraded';
        resultDescription = 'Score did not match any predefined result category.';
      } else {
        resultTitle = matchedResult.title;
        resultDescription = matchedResult.description;
      }
    }

    // Save attempt
    await this.attemptModel.create({
      userId,
      assessmentId: dto.assessmentId,
      answers: dto.answers,
      totalScore,
      resultTitle,
      resultDescription,
    });

    return {
      score: totalScore,
      result: {
        title: resultTitle,
        description: resultDescription,
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
      throw new NotFoundException('Assessment not found');
    }

    // EXPLICITLY CAST to ObjectId to ensure consistency in the database
    const question = await this.questionModel.create({
      assessmentId: new Types.ObjectId(assessmentId),
      text: dto.text,
      order: dto.order,
      options: dto.options,
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
