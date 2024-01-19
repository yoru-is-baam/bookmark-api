import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  link: string;
}
