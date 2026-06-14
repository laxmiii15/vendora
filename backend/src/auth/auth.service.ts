import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  // A well-formed bcrypt hash used to equalize response time when the user
  // does not exist, so login latency can't be used to enumerate accounts.
  private readonly dummyHash =
    '$2b$10$CkNsxvG2rKf3W32GX/09O.ezCnX9x7W7lVf8xtrhSefdBcvyu7dpG';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.usersService.findByEmail(input.email);

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);

    const user = await this.usersService.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const { password: _password, ...safeUser } = user;

    return {
      accessToken: this.signToken(user.id, user.email),
      user: safeUser,
    };
  }

  async login(input: LoginInput) {
    const user = await this.usersService.findByEmail(input.email);

    // Always run a bcrypt comparison — even when the user is missing — so the
    // response time doesn't reveal whether the email exists (no enumeration).
    const passwordHash = user?.password ?? this.dummyHash;
    const passwordValid = await bcrypt.compare(input.password, passwordHash);

    if (!user || !user.password || !passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...safeUser } = user;

    return {
      accessToken: this.signToken(user.id, user.email),
      user: safeUser,
    };
  }

  private signToken(userId: string, email: string): string {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const expiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    const payload: JwtPayload = { sub: userId, email };

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
  }
}
