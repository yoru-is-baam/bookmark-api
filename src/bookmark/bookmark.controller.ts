import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { OwnershipGuard } from './guards';

@ApiBearerAuth()
@ApiTags('Bookmarks')
@UseGuards(JwtGuard)
@Controller({
  path: 'bookmarks',
  version: '1',
})
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Get bookmarks successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Create a bookmark successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  createBookmark(@GetUser('id') userId: number, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Get bookmark by id successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  getBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'Edit bookmark by id successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access to the resources denied.' })
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'Delete bookmark by id successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not logged in.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access to the resources denied.' })
  deleteBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
