import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from "class-validator";

import { Type } from "class-transformer";

export class AnswerDto {
  @IsString()
  questionId: string;

  @IsNumber()
  @Type(() => Number)
  score: number;
}

export class SubmitAssessmentDto {
  @IsString()
  assessmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class ResultDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  minScore: number;

  @IsNumber()
  maxScore: number;
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
