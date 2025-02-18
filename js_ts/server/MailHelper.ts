import { NodeMailgun } from 'ts-mailgun';
import { MailgunTemplate } from 'ts-mailgun/dist/mailgun-template.js';
import config from '../../config.js';

const MAILGUN_KEY = config.mailgunConfig.apiKey;
const MAILGUN_DOMAIN = config.mailgunConfig.domain;
const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;
const MAILGUN_FROM_NAME = process.env.MAILGUN_FROM_NAME;

export class MailHelper {

    private mailer: NodeMailgun;

    constructor() {
        this.mailer = new NodeMailgun(MAILGUN_KEY, MAILGUN_DOMAIN);
        this.mailer.fromEmail = MAILGUN_FROM_EMAIL; // Set your from email
        this.mailer.fromTitle = MAILGUN_FROM_NAME; // Set the name you would like to send from
        this.mailer.init();
    }

    public sendEmailTemplate = async (email: string, subject: string, template: string, vars: any) => {
        try {
            let t: boolean | MailgunTemplate = this.mailer.getTemplate(template);
            if (t && t instanceof MailgunTemplate) {
                await this.mailer
                    .send(email, subject, "", vars, { template })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify(e),
            };
        }
    };
}

export default new MailHelper();