export * from './clientAPI.service';
import { ClientAPIService } from './clientAPI.service';
export * from './clientSearchAPI.service';
import { ClientSearchAPIService } from './clientSearchAPI.service';
export const APIS = [ClientAPIService, ClientSearchAPIService];
