import { HttpException, Injectable } from '@nestjs/common';
import { ClientAPIService } from 'src/service/fsa-resources';
import { AppConfigService } from 'src/app-config/app-config.service';
import { TimeoutError, map, lastValueFrom, catchError, timeout } from 'rxjs';

@Injectable()
export class FsaResourceService {
  private static readonly LOOKUP_TIMEOUT_MS = 5000;

  constructor(
    private readonly clientApiService: ClientAPIService,
    private readonly appConfig: AppConfigService,
  ) {}

  async findByClientNumber(id: string) {
    const response = this.clientApiService
      .findByClientNumber(id, this.appConfig.forestClientApiKey)
      .pipe(
        timeout(FsaResourceService.LOOKUP_TIMEOUT_MS),
        map((response) => response.data),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Forest Client API request timed out', 504);
          }

          if (err instanceof HttpException) {
            throw err;
          }

          const status =
            typeof err?.status === 'number'
              ? err.status
              : (err?.response?.status ?? 502);
          const payload =
            err?.response?.data ?? 'Failed to fetch site operator details';
          throw new HttpException(payload, status);
        }),
      );
    return lastValueFrom(response);
  }
}
