import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @ApiProperty({
    required: false,
    example: 'vlad@codewithvlad.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    required: false,
    example: 'Vladimir',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
