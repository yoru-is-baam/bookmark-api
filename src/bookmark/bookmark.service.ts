import { Inject, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Bookmark } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private getCacheKey(userId: number) {
    return `bookmarks${userId}`;
  }

  private getCacheBookmarks(userId: number) {
    return this.cacheManager.get<{ [bookmarkId: string]: Bookmark }>(this.getCacheKey(userId));
  }

  async getBookmarks(userId: number) {
    const cacheBookmarks = await this.getCacheBookmarks(userId);

    if (cacheBookmarks) {
      return Object.values(cacheBookmarks);
    } else {
      // fetch bookmarks from db
      const bookmarks = await this.prisma.bookmark.findMany({ where: { userId } });

      // convert bookmarks to bookmarks object
      const bookmarksObject = bookmarks.reduce(
        (accumulator, bookmark) => {
          accumulator[bookmark.id.toString()] = bookmark;
          return accumulator;
        },
        {} as { [bookmarkId: string]: Bookmark },
      );

      // cache bookmarks object
      await this.cacheManager.set(this.getCacheKey(userId), bookmarksObject, 15 * 60 * 1000);

      return bookmarks;
    }
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark: Bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    const cacheBookmarks = await this.getCacheBookmarks(userId);

    if (cacheBookmarks) {
      // Add the new bookmark to the existing bookmarks
      cacheBookmarks[bookmark.id.toString()] = bookmark;

      // Update the cache with the modified bookmarks
      await this.cacheManager.set(this.getCacheKey(userId), cacheBookmarks, 15 * 60 * 1000);
    }

    return bookmark;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const cacheBookmarks = await this.getCacheBookmarks(userId);

    if (cacheBookmarks) {
      // If the list is in memory, find the specific bookmark by ID
      const bookmark = cacheBookmarks[bookmarkId];
      if (bookmark) {
        return bookmark;
      }
    }

    return this.prisma.bookmark.findFirst({ where: { id: bookmarkId, userId } });
  }

  async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    // find in cache and update
    const cacheBookmarks = await this.getCacheBookmarks(userId);

    if (cacheBookmarks) {
      if (cacheBookmarks[bookmarkId]) {
        cacheBookmarks[bookmarkId] = { ...cacheBookmarks[bookmarkId], ...dto };
        // Update the cache with the modified bookmarks
        await this.cacheManager.set(this.getCacheKey(userId), cacheBookmarks, 15 * 60 * 1000);
      }
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // find in cache and delete
    const cacheBookmarks = await this.getCacheBookmarks(userId);

    if (cacheBookmarks) {
      if (cacheBookmarks[bookmarkId]) {
        delete cacheBookmarks[bookmarkId];
        // Update the cache with the modified bookmarks
        await this.cacheManager.set(this.getCacheKey(userId), cacheBookmarks, 15 * 60 * 1000);
      }
    }

    await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }
}
