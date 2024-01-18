import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully signed up.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Credentials taken.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input value' })
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully signed in.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Credentials incorrect.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input value' })
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
