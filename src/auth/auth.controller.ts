// auth.controller.ts
import {
  Controller, Post, Body, HttpCode, UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './decorators/user.decorator';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login com email e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Token JWT retornado com sucesso' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-role')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar função de outro usuário (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 3 },
        newRole: { type: 'number', example: 2 },
      },
    },
  })
  async changeRoleSuper(
    @User('role') requesterRole: number,
    @User('id') requesterId: number,
    @Body() body: { userId: number; newRole: number },
  ) {
    return this.authService.changeRoleSuper(body.userId, body.newRole, requesterRole, requesterId);
  }
}
