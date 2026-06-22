import { BadRequestException, Delete, Controller, Patch, Post, Get, Param, Body, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { AssessmentService } from "../services/assessment.service";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateAssessmentDto, SubmitAssessmentDto, UpdateAssessmentDto, CreateQuestionDto } from "../dto/assessment.dto";
import { AuthGuard } from "@nestjs/passport";
import { isValidObjectId } from "mongoose";


@Controller("assessments")
export class AssessmentController {
  constructor(private readonly service: AssessmentService) { }

  @Post("submit")
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @UseGuards(AuthGuard('jwt'))
  submit(
    @Req() req,
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.service.submit(req.user.userId, dto);
  }

  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateAssessmentDto) {
    return this.service.create(dto);
  }


  @Get("attempts")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access-token")
  async getAttempts(@Req() req) {
    return this.service.getAttempts(req.user.userId);
  }

  @Get(":id/attempts")
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard("jwt"))
  async getAssessmentAttempts(
    @Req() req,
    @Param("id") id: string,
  ) {
    if (req.user.role !== "admin") {
      throw new ForbiddenException("forbidden");
    }

    return this.service.getAssessmentAttempts(id);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }



  @Patch(":id/publish")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async togglePublish(
    @Req() req,
    @Param("id") id: string,
    @Body("isPublished") isPublished: boolean,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException();
    }
    return this.service.togglePublish(id, isPublished);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(
    @Req() req,
    @Param("id") id: string,
    @Body() dto: UpdateAssessmentDto,
  ) {
    if (req.user.role !== "admin") {
      throw new ForbiddenException();
    }
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid assessment id");
    }
    return this.service.update(id, dto);
  }

  @Post(":id/questions")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access-token")
  async addQuestion(
    @Req() req,
    @Param("id") id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    if (req.user.role !== "admin") {
      throw new ForbiddenException("forbidden");
    }

    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid assessment id");
    }
    return this.service.addQuestion(id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard("jwt"))
  async removeAssessment(
    @Req() req,
    @Param("id") id: string,
  ) {
    if (req.user.role !== "admin") {
      throw new ForbiddenException("forbidden");
    }

    return this.service.removeAssessment(id);
  }

  @Delete("questions/:id")
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard("jwt"))
  async removeQuestion(
    @Req() req,
    @Param("id") id: string,
  ) {
    if (req.user.role !== "admin") {
      throw new ForbiddenException("forbidden");
    }

    return this.service.removeQuestion(id);
  }
}
