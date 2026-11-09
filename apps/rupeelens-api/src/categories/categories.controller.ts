import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import type { UserCategory } from '@shared-types';

import { UserId } from '../auth/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@UserId() ownerId: string): Promise<UserCategory[]> {
    return this.categories.list(ownerId);
  }

  @Post()
  add(
    @UserId() ownerId: string,
    @Body() body: CreateCategoryDto
  ): Promise<UserCategory[]> {
    return this.categories.add(ownerId, body.name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @UserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.categories.remove(ownerId, id);
  }
}
