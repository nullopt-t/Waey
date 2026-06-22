import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AssessmentDocument = HydratedDocument<Assessment>;

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isPublished: boolean;

  // embedded result logic (simple + fast)
  @Prop([
    {
      minScore: Number,
      maxScore: Number,
      title: String,
      description: String,
    },
  ])
  results: {
    minScore: number;
    maxScore: number;
    title: string;
    description: string;
  }[];
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
