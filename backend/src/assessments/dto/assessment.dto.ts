import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUrl
} from "class-validator";

import { Type } from "class-transformer";

export class AnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  optionId: string;
}

export class SubmitAssessmentDto {
  @IsString()
  assessmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class RecommendationDto {
  @IsString()
  text: string; // The description/text of the recommendation

  @IsString()
  @IsUrl() // Validate as a URL string
  link: string; // The URL associated with the recommendation
}

export class ResultDto {
  @IsNumber() // Min score should be a number
  minScore: number;

  @IsNumber() // Max score should be a number
  maxScore: number;

  @IsString() // Title from admin (e.g., "High Depression")
  title: string;

  @IsString() // Description from admin (e.g., "Indicates severe symptoms...")
  description: string;

  @IsString() // Personalized message from admin
  message: string;

  @IsArray() // Recommendations array
  @Type(() => RecommendationDto)
  @IsOptional() // Make it optional if not always provided during creation
  recommendations: [RecommendationDto]; // Or use a more complex object type if recommendations have structure

  @IsBoolean() // Flag for doctor referral
  needsDoctor: boolean;
}

export class OptionDto {
  @IsString()
  label: string;

  @IsNumber()
  score: number;
}

export class QuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}

export class CreateAssessmentDto {
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultDto)
  results: ResultDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultDto) // Use the ResultDto defined earlier
  results?: ResultDto[];
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsNumber()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}
