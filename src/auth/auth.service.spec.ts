import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto';
import { ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  const dto: AuthDto = { email: 'test@gmail.com', password: '123' };
  const hashedPassword = 'hashedPassword';
  const mockAccessToken = 'mockAccessToken';
  const mockSecret = 'mockSecret';
  const userId = 1;
  const payload = { sub: userId, email: dto.email };
  const options = { expiresIn: '15m', secret: mockSecret };
  const user = { id: userId, email: dto.email, hash: hashedPassword };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and return a token', async () => {
      // Arrange
      jest.spyOn(argon, 'hash').mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);
      mockConfigService.get.mockReturnValue(mockSecret);

      // Act
      const result = await authService.signup(dto);

      // Assert
      expect(argon.hash).toHaveBeenCalledWith(dto.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { email: dto.email, hash: hashedPassword },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, options);
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw ForbiddenException if credentials are taken', async () => {
      // Arrange
      mockPrismaService.user.create.mockRejectedValue(
        new PrismaClientKnownRequestError('', { code: 'P2002', clientVersion: '' }),
      );

      // Act & Assert
      await expect(authService.signup(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should rethrow other errors', async () => {
      // Arrange
      mockPrismaService.user.create.mockRejectedValue(new Error('Some unexpected error'));

      // Act & Assert
      await expect(authService.signup(dto)).rejects.toThrow(Error('Some unexpected error'));
    });
  });

  describe('signin', () => {
    it('should sign in a user and return a token', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);
      mockConfigService.get.mockReturnValue(mockSecret);

      // Act
      const result = await authService.signin(dto);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(argon.verify).toHaveBeenCalledWith(hashedPassword, dto.password);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, options);
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw ForbiddenException if credentials are incorrect', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.signin(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password is incorrect', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      // Act & Assert
      await expect(authService.signin(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('signToken', () => {
    it('should sign a token with the correct payload', async () => {
      // Arrange
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);
      mockConfigService.get.mockReturnValue(mockSecret);

      // Act
      const result = await authService.signToken(userId, dto.email);

      // Assert
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, options);
      expect(result).toEqual({ access_token: mockAccessToken });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
