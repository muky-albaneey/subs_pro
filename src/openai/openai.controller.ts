/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Post, Query, Res } from '@nestjs/common';

import { OpenaiService } from './openai.service';
import { ResponseEntity } from 'src/user/entities/response.entity';
import { PromptEntity } from 'src/user/entities/reponse_prompt.entity';
import type { Response } from 'express';
import { PeriodDto } from 'src/utils/filter.dto';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('captions')
  async getChatCompletion(@Res({ passthrough: true }) response: Response, 
    @Body('prompt') prompt: string,
    @Body('userId') userId: string, // Accept userId in the request body
    @Body('no_of_captions') no_of_captions: number,
    @Body('words_per_caption') words_per_caption: number,
    @Body('tone') tone: string,
    @Body('customEmojis') customEmojis?: boolean,
    @Body('customHashtags') customHashtags?: boolean,
    @Body('isContact') isContact?: boolean, 
    
  ): Promise<any> {
    const result = await this.openaiService.captionsAi(
      prompt,
      userId, // Pass userId to the service
      no_of_captions,
      words_per_caption,
      tone,
      customEmojis,
      customHashtags,
      isContact
    );

    return response.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: result,
    });
  }
  // @Param('id', ParseUUIDPipe)

  @Post('prompt')
  async getPrompt(@Body('prompt') prompt: string, @Body('userId') userId: string, @Res({ passthrough: true }) response: Response): Promise<any> {
    const result = this.openaiService.promptAi(prompt, userId);
    return response.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: result,
    });
  }

  @Get(':id/caption-responses')
  async getLastTenCaptionResponses(@Param('id', ParseUUIDPipe) userId: string): Promise<ResponseEntity[]> {
    try {
      const captionResponses = await this.openaiService.findLastTenCaptionResponses(userId);
      return captionResponses;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // New endpoint to get the last ten prompt_responses
  @Get(':id/prompt-responses')
  async getLastTenPromptResponses(@Param('id', ParseUUIDPipe) userId: string): Promise<PromptEntity[]> {
    try {
      const promptResponses = await this.openaiService.findLastTenPromptResponses(userId);
      return promptResponses;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

 
  @Get('count-today')
  async getCountEntitiesToday(): Promise<{
    day: string;
    dayCount: { response: number; prompts: number }[];  // Array of objects with response and prompts
    weekCount: { response: number; prompts: number }[]; // Array of objects with response and prompts
    totalDayCount: number;  // Total counts for today
    totalWeekCount: number; // Total counts for the week
    totalCount: number;     // Total count for everything (all time)
    weekDetails: { caption: string; content: { response: number; prompts: number } }[]; // Array of objects with response and prompts
  }>  {
    return this.openaiService.countEntitiesTodayAndWeek();
  }

  @Get('userCount/:userId')
  async countEntitiesForUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    try {
      // Call the service method to get counts for the specified user
      const result = await this.openaiService.countEntitiesTodayAndWeekForUser(userId);
      return result;
    } catch (error) {
      // Handle errors, e.g., user not found, etc.
      throw new Error(`Failed to fetch counts for user ${userId}: ${error.message}`);
    }
  }

  @Get('dashboard')
  async getAiActivities(@Query() filter: PeriodDto) {
    return this.openaiService.getAiActivities(filter.period);
  }

  @Get('percentage')
  async getAiToolsCompared(@Query() filter: PeriodDto) {
    return this.openaiService.getAiToolsCompared(filter.period);
  }
  
}
