## @

### Building

To install the required dependencies and to build the typescript sources run:

```
npm install
npm run build
```

#### General usage

In your Nestjs project:

```
// without configuring providers
import { ApiModule } from '';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        ApiModule,
        HttpModule
    ],
    providers: []
})
export class AppModule {}
```

```
// configuring providers
import { ApiModule, Configuration, ConfigurationParameters } from '';

export function apiConfigFactory (): Configuration => {
  const params: ConfigurationParameters = {
    // set configuration parameters here.
  }
  return new Configuration(params);
}

@Module({
    imports: [ ApiModule.forRoot(apiConfigFactory) ],
    declarations: [ AppComponent ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```
import { DefaultApi } from '';

export class AppComponent {
    constructor(private apiGateway: DefaultApi) { }
}
```

Note: The ApiModule a dynamic module and instantiated once app wide. This is to
ensure that all services are treated as singletons.

#### Using multiple swagger files / APIs / ApiModules

In order to use multiple `ApiModules` generated from different swagger files,
you can create an alias name when importing the modules in order to avoid naming
conflicts:

```
import { ApiModule } from 'my-api-path';
import { ApiModule as OtherApiModule } from 'my-other-api-path';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ApiModule,
    OtherApiModule,
    HttpModule
  ]
})
export class AppModule {

}
```

### Set service base path

If different than the generated base path, during app bootstrap, you can provide
the base path to your service.

```
import { BASE_PATH } from '';

bootstrap(AppComponent, [
    { provide: BASE_PATH, useValue: 'https://your-web-service.com' },
]);
```

or

```
import { BASE_PATH } from '';

@Module({
    imports: [],
    declarations: [ AppComponent ],
    providers: [ provide: BASE_PATH, useValue: 'https://your-web-service.com' ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

### Configuring the module with `forRootAsync`

You can also use the Nestjs Config Module/Service to configure your app with
`forRootAsync`.

```
@Module({
    imports: [
      ApiModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService): Configuration => {
          const params: ConfigurationParameters = {
            // set configuration parameters here.
            basePath: config.get('API_URL'),
          };
          return new Configuration(params);
        },
      })
    ],
    declarations: [ AppComponent ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

#### Using @nestjs/cli

First extend your `src/environments/*.ts` files by adding the corresponding base
path:

```
export const environment = {
  production: false,
  API_BASE_PATH: 'http://127.0.0.1:8080'
};
```

In the src/app/app.module.ts:

```
import { BASE_PATH } from '';
import { environment } from '../environments/environment';

@Module({
  declarations: [
    AppComponent
  ],
  imports: [ ],
  providers: [
    {
      provide: 'BASE_PATH',
      useValue: environment.API_BASE_PATH
    }
  ]
})
export class AppModule { }
```
