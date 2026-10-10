import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlContextType } from '@nestjs/graphql';
import { Prisma } from '../generated/prisma/client';

// Translates Prisma's known errors (unique violation, missing record, broken
// relation) into proper HTTP errors. Without this they surface to clients as
// a generic 500 "Internal server error".
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mapped = this.toHttpException(exception);

    // GraphQL: returning the exception lets Apollo format it as a GraphQL error.
    if (host.getType<GqlContextType>() === 'graphql') {
      return mapped;
    }

    super.catch(mapped, host);
  }

  private toHttpException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (exception.code) {
      case 'P2002': {
        const target = exception.meta?.target;
        const fields = Array.isArray(target) ? target.join(', ') : undefined;
        return new ConflictException(
          fields
            ? `A record with this ${fields} already exists`
            : 'A record with this value already exists',
        );
      }
      case 'P2025':
        return new NotFoundException('Record not found');
      case 'P2003':
        return new BadRequestException(
          'Operation violates a relation — the record is still referenced or the referenced record does not exist',
        );
      default:
        // Unmapped codes are real bugs — keep the details in the server log.
        this.logger.error(
          `Unhandled Prisma error ${exception.code}: ${exception.message}`,
          exception.stack,
        );
        return new InternalServerErrorException();
    }
  }
}
