interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  async send(options: EmailOptions): Promise<void> {
    // Try SendGrid first, fall back to Resend
    if (process.env.SENDGRID_API_KEY) {
      await this.sendViaSendGrid(options);
    } else if (process.env.RESEND_API_KEY) {
      await this.sendViaResend(options);
    } else {
      console.warn('[EmailService] No email provider configured (SENDGRID_API_KEY or RESEND_API_KEY)');
    }
  }

  private async sendViaSendGrid(options: EmailOptions): Promise<void> {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from:    { email: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@sierra-estates.com' },
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`SendGrid error: ${err}`);
    }
  }

  private async sendViaResend(options: EmailOptions): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    options.from || 'Sierra Estates <noreply@sierra-estates.com>',
        to:      [options.to],
        subject: options.subject,
        html:    options.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }
  }
}
