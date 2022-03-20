import nodemailer from 'nodemailer'

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Hockey account activation on ' + process.env.API_URL,
      text: '',
      html: `
        <div>
          <h3>For your HOCKEY TEAM account activation please follow this link:</h3>
          <a href="${link}">${link}</a>
        </div>
      `,
    })
  }
}
export default new MailService()
