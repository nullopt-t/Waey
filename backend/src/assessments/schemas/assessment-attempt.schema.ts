import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AssessmentAttemptDocument =
  HydratedDocument<AssessmentAttempt>;

@Schema({ timestamps: true })
export class AssessmentAttempt {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Assessment", required: true })
  assessmentId: Types.ObjectId;

  @Prop([
    {
      questionId: { type: Types.ObjectId },
      score: Number,
    },
  ])
  answers: {
    questionId: Types.ObjectId;
    score: number;
  }[];

  @Prop()
  totalScore: number;

  @Prop()
  resultTitle: string;

  @Prop()
  resultDescription: string;
}

export const AssessmentAttemptSchema =
  SchemaFactory.createForClass(AssessmentAttempt);
