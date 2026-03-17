import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { SendMailService } from './services';
import { EEnvironmentConstants } from 'src/common';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get(EEnvironmentConstants.emailHost),
          secure: true,
          ports: parseInt(config.get(EEnvironmentConstants.emailPort) as string),
          auth: {
            user: config.get(EEnvironmentConstants.emailUsername),
            pass: config.get(EEnvironmentConstants.emailPassword),
          },
        },
        defaults: {
          from: `"FX Trading" <${config.get(EEnvironmentConstants.emailUsername)}>`,
        },
        template: {
          dir: join('dist', 'modules', 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SendMailService],
  exports: [SendMailService],
})
export class MailModule { }
