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

    const questions = await this.questionModel.find({ assessmentId: new Types.ObjectId(dto.assessmentId) });
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

    // Calculate percentage
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Find matching result
    let resultTitle = 'مكتمل'; // Default title in Arabic
    let resultDescription = 'تم إرسال الإجابة بنجاح.'; // Default description in Arabic
    let resultMessage = 'شكرًا لاستكمالك التقييم.'; // Default message in Arabic
    let recommendations: any[] = []; // Array for recommendations
    let needsDoctor = false; // Flag for doctor referral
    let matchedResultObject = null; // Store the matched object for potential extra data

    if (assessment.results && assessment.results.length > 0) {
      matchedResultObject = assessment.results.find(
        (r) => totalScore >= r.minScore && totalScore <= r.maxScore
      );

      if (!matchedResultObject) {
        // Fallback if score is outside all defined ranges
        resultTitle = 'غير محدد'; // Fallback title in Arabic
        resultDescription = 'لا يوجد نطاق تقييم مطابق.'; // Fallback description in Arabic
        resultMessage = 'تعذر تحديد نتيجة محددة بناءً على التقييم.'; // Fallback message in Arabic
      } else {
        resultTitle = matchedResultObject.title;
        resultDescription = matchedResultObject.description;
        // --- NEW: Extract message, recommendations, and doctor flag from matched result ---
        resultMessage = matchedResultObject.message || resultMessage; // Use defined message, fallback to default
        recommendations = matchedResultObject.recommendations || recommendations; // Use defined recommendations
        needsDoctor = !!matchedResultObject.needsDoctor; // Ensure boolean (truthy/falsy -> true/false)
      }
    }

    // --- Prepare answers array for AssessmentAttempt schema ---
    const formattedAnswers = dto.answers.map(answer => {
      const question = questionMap.get(answer.questionId); // Use the map created earlier
      if (!question) {
        // Handle edge case if question was not found during initial processing
        console.warn(`Question ${answer.questionId} not found for attempt.`);
        return { questionId: new Types.ObjectId(answer.questionId), score: 0 };
      }

      const selectedOption = question.options.find((opt: any) => opt._id.toString() === answer.optionId);
      if (!selectedOption) {
        // Handle edge case if option was not found during initial processing
        console.warn(`Option ${answer.optionId} not found for question ${answer.questionId}.`);
        return { questionId: new Types.ObjectId(answer.questionId), score: 0 };
      }

      // Return the structure expected by AssessmentAttemptSchema
      return {
        questionId: new Types.ObjectId(answer.questionId),
        score: selectedOption.score, // Use the score from the selected option
      };
    });

    // --- Save attempt with correct structure and calculated data ---
    await this.attemptModel.create({
      userId: new Types.ObjectId(userId), // Ensure ObjectId type if needed
      assessmentId: new Types.ObjectId(dto.assessmentId),
      answers: formattedAnswers, // Use the correctly formatted array
      totalScore, // Save the calculated total score
      maxScore, // Save max score
      percentage, // Save percentage
      resultTitle, // Save result title
      resultDescription, // Save result description
      resultMessage, // Save result message
      recommendations, // Save recommendations
      needsDoctor, // Save doctor referral flag
      matchedResultId: matchedResultObject?._id, // Optionally save matched result ID
    });

    // Return the enhanced data for the frontend
    return {
      success: true,
      score: totalScore,
      maxScore,
      percentage,
      result: {
        title: resultTitle,
        description: resultDescription,
        message: resultMessage,
      },
      recommendations,
      needsDoctor,
      // matchedResult: matchedResultObject, // If needed
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
