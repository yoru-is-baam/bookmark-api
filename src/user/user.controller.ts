import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  @HttpCode(HttpStatus.OK)
  @Get('me')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get user profile.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  getMe(@GetUser() user: User) {
    return { user };
  }
}
