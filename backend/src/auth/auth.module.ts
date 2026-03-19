import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ExpertsModule } from '../experts/experts.module';
import { StartupsModule } from '../startups/startups.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => ExpertsModule),
    forwardRef(() => StartupsModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'secretKey'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}