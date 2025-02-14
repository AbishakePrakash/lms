var brand = 'GRAVITUS';
var fromMail = '"GRAVITUS " <no-reply@gravitus.io>';

var transporter = mailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: 'AKIAIFSQIBLZ5OZMZPSA',
    pass: 'AqgSHYnHA7gOeveNkunLkjEEVFCr8SM+P+4e/ualuGdF',
  },
});

var title = OTPMessage;
var message = OTPAdditional;

var paraOne = '';
var paraTwo = '';

var mailOptions = {
  from: fromMail,
  to: userProfile.emailId,
  subject: OTPSubject,
  html:
    '<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <title>GRAVITUS</title> <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head><body style="margin:0; padding:0; background-color:#f8f8f8; padding-top: 10px;"> <div leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0" style="height:auto !important;width:100% !important; font-family: Helvetica,Arial,sans-serif !important; margin-bottom: 40px;"> <center> <table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" style="max-width: 800px; background-color: #ffffff; border: 1px solid #e4e2e2; border-collapse: separate !important; border-radius:4px;border-spacing:0;color:#242128; margin:0;padding:40px;" heigth="auto"> <tbody> <tr> <td align="left" valign="center" width="50%" style="padding-bottom:24px; border-top:0; height:100% !important;"> <img style="width: 156px;" src="' +
    hostNode +
    '/essentials/logo/colored.png"/> </td><td align="right" valign="center" width="150%" style="padding-bottom:40px; border-top:0; height:100% !important;"> <span style="color: #8f8f8f; font-weight: bold; line-height: 2; font-size: 12px;">Building Tech & Community</span> </td></tr><tr> <td colspan="2" style="padding-top:10px; border-top:1px solid #e4e2e2"> <h3 style="padding-bottom: 10px; color:#444; font-size:20px; line-height: 1.6; font-weight:700;"> ' +
    title +
    ' </h3> <p style="color:#8f8f8f; font-size: 14px; font-weight: bold; line-height: 1.4; padding-bottom: 20px;"> ' +
    message +
    ' </p><p style="padding-top: 10px; color:#8f8f8f; font-size: 14px; line-height: 1.4;"> ' +
    paraOne +
    ' </p><p style="padding-top: 10px; color:#8f8f8f; font-size: 14px; padding-bottom: 30px; line-height: 1.4; border-bottom: 1px solid #e4e2e2;"> ' +
    paraTwo +
    ' <span style="color: #444; font-weight: bold;"></span> </p><p style="color:#8f8f8f; font-size: 12px; line-height: 1;"> For questions about this email. Please Contact </p><p style="color:#8f8f8f; font-size: 12px; padding-bottom: 20px; line-height: 1;"> <a href="mailto: info@gravitus.io">info@gravitus.io</a> </p></td></tr></tbody> </table> <table style="margin-top: 20px; padding-bottom: 10px; margin-bottom: 10px;"> <tbody> <tr> <td align="center" valign="center"> <p style="font-size: 12px; text-decoration: none; line-height: 1; color:#909090; margin-top:0px; "> &#169; 2022 gravitus </p><p style="font-size: 12px; text-decoration: none; line-height: 1; color:#909090; margin-top:0px; "> Please do not reply to this email. </p><!-- <p style="font-size: 12px; line-height:1; color:#909090; margin-top:5px;"> <a href="#" style="color: #145388; text-decoration:none;">Privacy Policy</a> | <a href="#" style="color: #145388; text-decoration:none;">Unscubscribe</a> </p>--> </td></tr></tbody> </table> </center> </div></body></html>',
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    reject(error);
  } else {
    resolve(info);
  }
});
