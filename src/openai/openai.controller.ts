import { Body, Controller, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {

  constructor(private readonly openaiService: OpenaiService) {}

  
  @Get('chat-completion')
  async getChatCompletion(@Body('prompt') prompt: string): Promise<string> {
    const customEmojis = ['🔥', '🚀', '🎉'];
    const customHashtags = ['OpenAI', 'AI', 'Tech'];
    
    const result = await this.openaiService.getChatCompletion(
      'What are the latest AI trends?',
      3,
      25,
      customEmojis,
      customHashtags,
    );
    
    return result;
  }

}
