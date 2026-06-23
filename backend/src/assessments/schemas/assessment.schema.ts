import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, HydratedDocument } from "mongoose";

export type AssessmentDocument = HydratedDocument<Assessment>;


const RecommendationSchema = new MongooseSchema({ // Use the Schema imported from @nestjs/mongoose
  text: { type: String, required: true },
  link: { type: String, required: true },
});


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
      title: { type: String, required: true },
      description: { type: String, required: true },
      message: { type: String, required: true },
      recommendations: [RecommendationSchema], // Use the sub-schema
      needsDoctor: { type: Boolean, default: false },
    },
  ])
  results: {
    minScore: number;
    maxScore: number;
    title: string;
    description: string;
    message: string;
    recommendations: {
      text: string; // Define the structure inline or use a type alias
      link: string;
    }[]; // Reflect the structure in the TS type
    needsDoctor: boolean;
  }[];
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
