interface SendEmailParams {
  to: string
  subject: string
  text: string
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (process.env.USE_REAL_EMAIL === 'true') {
    // @ts-ignore — resend is not installed until USE_REAL_EMAIL is enabled
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'MundoJam <noreply@mundojam.com>',
      to: params.to,
      subject: params.subject,
      text: params.text,
    })
    return
  }

  console.log('[EMAIL]', {
    to: params.to,
    subject: params.subject,
    text: params.text,
  })
}
