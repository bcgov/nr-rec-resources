import { HttpException, Injectable } from '@nestjs/common';
import { ClientAPIService } from 'src/service/fsa-resources';
import { AppConfigService } from 'src/app-config/app-config.service';
import { map, lastValueFrom, catchError } from 'rxjs';

@Injectable()
export class FsaResourceService {
  constructor(
    private readonly clientApiService: ClientAPIService,
    private readonly appConfig: AppConfigService,
  ) {}

  async findByClientNumber(id: string) {
    const response = this.clientApiService
      .findByClientNumber(id, this.appConfig.forestClientApiKey)
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          throw new HttpException(err.response.data, err.status);
        }),
      );
    return lastValueFrom(response);
  }
}
