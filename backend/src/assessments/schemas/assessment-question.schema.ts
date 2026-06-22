import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AssessmentQuestionDocument =
  HydratedDocument<AssessmentQuestion>;

@Schema({ timestamps: true })
export class AssessmentQuestion {
  @Prop({ type: Types.ObjectId, ref: "Assessment", required: true })
  assessmentId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  order: number;

  @Prop([
    {
      label: String,
      score: Number,
    },
  ])
  options: {
    label: string;
    score: number;
  }[];
}

export const AssessmentQuestionSchema =
  SchemaFactory.createForClass(AssessmentQuestion);
