import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Post()
  add(
    @CurrentUser() user: User,
    @Body() body: { type: 'topic' | 'question'; targetId: string; note?: string },
  ) {
    return this.favorites.add(user.id, body.type, body.targetId, body.note);
  }

  @Delete(':type/:targetId')
  remove(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('targetId') targetId: string,
  ) {
    return this.favorites.remove(user.id, type, targetId);
  }

  @Get()
  list(@CurrentUser() user: User, @Query('type') type?: string) {
    return this.favorites.list(user.id, type);
  }

  @Get('check/:type/:targetId')
  check(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('targetId') targetId: string,
  ) {
    return this.favorites.check(user.id, type, targetId);
  }
}
