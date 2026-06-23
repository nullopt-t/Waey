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
      minScore: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      title: { type: String, required: true }, // Admin-defined title
      description: { type: String, required: true }, // Admin-defined description
      message: { type: String, required: true }, // Admin-defined message
      recommendations: [{ type: String }], // Or define a sub-schema if needed
      needsDoctor: { type: Boolean, default: false }, // Admin-defined flag
    },
  ])
  results: {
    minScore: number;
    maxScore: number;
    title: string;
    description: string;
    message: string; // <-- Add this
    recommendations: string[]; // <-- Add this
    needsDoctor: boolean; // <-- Add this
  }[];
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
