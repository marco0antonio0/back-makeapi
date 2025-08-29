import { ConflictException, Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './auth.repositories';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly userRepository: UserRepository) { }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  encode(payload: object, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
      ...options,
    });
  }

  decode(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (e) {
      return null;
    }
  }

  async register(data: RegisterDto) {
    const { username, email, password } = data;
    // Se já existe conta confirmada com o mesmo username, bloqueia
    // const usernameExists = await this.userRepository.findUserByName(username);
    // if (usernameExists) {
    //   throw new ConflictException('Já existe uma conta com este username. Não é possível cadastrar com este username.');
    // }

    const existingUser = await this.userRepository.findUser(email);
    if (existingUser) {
      throw new ConflictException('Usuário já existe');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.userRepository.createUser({
      ...data, password: hashedPassword, role: 1
    });

    return { access_token: this.encode({ id: user.id, email: user.email }) };
  }

  async login(data: LoginDto) {
    const { email, password } = data;
    const user = await this.userRepository.findUser(email);

    if (!user || !(await this.comparePasswords(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const payload = { id: user.id, email: user.email, role: user.role };

    const access_token = user.role === 3
      ? this.encode(payload, { expiresIn: '5y' })
      : this.encode(payload, { expiresIn: '24h' });
    return {
      access_token,
      status: 200,
      id: user.id,
    };
  }

  async changeRoleSuper(
    targetUserId: number,
    newRole: number,
    requesterRole: number,
    requesterId: number,
  ) {
    if (!Number.isInteger(newRole) || newRole < 0) {
      throw new BadRequestException('O valor de role não pode ser negativo');
    }

    if (targetUserId === requesterId) {
      throw new ForbiddenException('Você não pode alterar sua própria função');
    }

    const targetUser = await this.userRepository.findUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Usuário alvo não encontrado');
    }

    // 🔐 Regras de permissão hierárquicas
    if (requesterRole >= 4) {
      if (newRole >= 4) {
        throw new ForbiddenException('Você não pode atribuir essa função');
      }
    } else if (requesterRole === 3) {
      if (newRole >= 3 || targetUser.role >= 3) {
        throw new ForbiddenException('Você não tem permissão para alterar esta função');
      }
    } else {
      throw new ForbiddenException('Você não tem permissão para alterar funções');
    }

    await this.userRepository.updateUserRole(targetUserId, newRole);

    return {
      status: 200,
      success: true,
      message: 'Função do usuário alterada com sucesso',
    };
  }
  private now() { return new Date(); }
  private addMinutes(d: Date, m: number) { return new Date(d.getTime() + m * 60 * 1000); }

}
