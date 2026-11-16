/**
 * Base HTML layout for all Arkam Ventures emails.
 * Wraps any body HTML in a consistent branded shell.
 */
export function baseLayout(bodyHtml: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Arkam Ventures</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preview text (hidden) -->
  <span style="display:none;font-size:1px;color:#f5f5f5;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</span>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;min-width:100%;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Email card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1E1A1A;padding:28px 40px;text-align:center;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Arkam <span style="color:#EE6723;">Ventures</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px 40px;color:#1E1A1A;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #eeeeee;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#888888;font-family:Arial,Helvetica,sans-serif;">
                Arkam Ventures &nbsp;|&nbsp; Indiqube Leela, 6th Floor, No.23, HAL 2nd Stage, Old Airport Road, Bangalore 560008
              </p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:Arial,Helvetica,sans-serif;">
                You are receiving this email because you have an account with Arkam Ventures.
              </p>
              <p style="margin:12px 0 0 0;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
                <a href="https://arkamvc.com" style="color:#EE6723;text-decoration:none;">arkamvc.com</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/** Replace {{variable}} placeholders with values from data object */
export function interpolate(html: string, data: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}
