import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get user profile.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  getMe(@GetUser() user: User) {
    return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Patch()
  @ApiResponse({ status: HttpStatus.OK, description: 'Update user successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
