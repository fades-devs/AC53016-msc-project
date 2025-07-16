export const emailSubject = "Action Required: Annual Module Review Reminder";
export const reviewSystemLink = "http://localhost:5173/create-review"; // app's link
export const emailMessageHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd; margin-top: 20px;">
          <tr><td align="center" style="background-color: #003c71; padding: 20px 0; color: #ffffff; font-size: 24px; font-weight: bold;">University of Dundee</td></tr>
          <tr><td style="padding: 40px 30px;">
              <h1 style="font-size: 22px; margin: 0;">Annual Module Review Reminder</h1>
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">Dear Module Lead,</p>
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">This is a friendly reminder that your annual module review for the current academic year is pending completion.</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding: 20px 0;">
                  <a href="${reviewSystemLink}" style="background-color: #007bff; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Complete Your Review</a>
              </td></tr></table>
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">Kind regards,<br><strong>The Module Review Team</strong></p>
          </td></tr>
          <tr><td align="center" style="background-color: #eeeeee; padding: 20px 30px; font-size: 12px; color: #666666;"><p style="margin: 0;">University of Dundee, Nethergate, Dundee, DD1 4HN</p></td></tr>
        </table>
      </body>
      </html>
    `;