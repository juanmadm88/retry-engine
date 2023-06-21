import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class CheckCountryMiddleware implements NestInterceptor {
  constructor(private configService: ConfigService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const countryHeader = context.switchToHttp().getRequest()?.headers?.[
      'x-flow-country'
    ];
    const countryConfig = this.configService.get<string>('appConfig.country');
    if (!countryHeader)
      throw new BadRequestException('The country is mandatory');
    if (countryConfig !== countryHeader)
      throw new BadRequestException('The country is not correct');
    return next.handle();
  }
}
