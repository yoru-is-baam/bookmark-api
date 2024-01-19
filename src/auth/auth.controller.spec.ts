import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

describe('AuthController', () => {
  let authController: AuthController;
  const mockResult = { access_token: 'mockedAccessToken' };
  const dto: AuthDto = { email: 'test@gmail.com', password: '123' };

  const mockAuthService = {
    signup: jest.fn((dto) => {
      return mockResult;
    }),
    signin: jest.fn((dto) => {
      return mockResult;
    }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should sign up a user successfully', async () => {
    expect(authController.signup(dto)).toEqual(mockResult);
    expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
  });

  it('should sign in a user successfully', async () => {
    expect(authController.signin(dto)).toEqual(mockResult);
    expect(mockAuthService.signin).toHaveBeenCalledWith(dto);
  });
});
