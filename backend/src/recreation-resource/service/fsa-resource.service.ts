import { Injectable } from "@nestjs/common";
import { ClientAPIService } from "src/service/fsa-resources";
import { map, lastValueFrom, catchError } from "rxjs";

const API_KEY = process.env.API_KEY || "";

@Injectable()
export class FsaResourceService {
  constructor(private readonly clientApiService: ClientAPIService) {}

  async findByClientNumber(id: string) {
    const response = this.clientApiService.findByClientNumber(id, API_KEY).pipe(
      map((response) => response.data),
      catchError((err) => {
        throw err;
      }),
    );
    return lastValueFrom(response);
  }
}
