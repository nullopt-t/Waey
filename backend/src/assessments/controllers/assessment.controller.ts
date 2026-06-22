import { Controller, Post, Get, Param, Body, Req, UseGuards } from "@nestjs/common";
import { AssessmentService } from "../services/assessment.service";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateAssessmentDto, SubmitAssessmentDto } from "../dto/assessment.dto";
import { AuthGuard } from "@nestjs/passport";

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

  @Get(":id")
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  findAll() {
    return this.service.findAll();
  }
}
