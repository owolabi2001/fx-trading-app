import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SendMailService {
  private readonly logger = new Logger(SendMailService.name);

  constructor(private mailService: MailerService) { }

  async sendMail(
    to: string,
    subject: string,
    templateName: string,
    context: any,
  ) {
    try {
      await this.mailService.sendMail({
        to,
        subject,
        template: `./${templateName}`,
        context,
      });
      this.logger.debug('Email sent successfully');
      return {
        message: 'Email sent successfully',
      };
    } catch (error) {
      this.logger.warn(error.message);
    }
  }

  sendMailTest() {
    this.mailService.sendMail({
      to: 'owolabitemiolamide@gmail.com',
      subject: 'Mail Test',
      template: './email-verification.hbs',
      context: {
        appName: 'FX trader Pro',
        firstName: "Temi",
        otp: '1124',
        year: new Date().getFullYear(),
      },
    });

    this.logger.debug('Email sent');
  }
}
