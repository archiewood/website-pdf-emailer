// index.js
const puppeteer = require("puppeteer");
require('dotenv').config();


const filename = 'doormart.pdf';
// https://evidence-demo.netlify.app/partner-reports/Doormart
const URL = 'https://auth.evidence.app/handbook?reset=true';


(async () => {
    
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(URL, {
        waitUntil: "networkidle2"
    });
    // login
    await page.waitForSelector('button[aria-label="Sign in"]', {visible: true})

    await page.type('#email', process.env.EVIDENCE_USERNAME);
    await page.type('input[type="password"]', process.env.EVIDENCE_PASSWORD);
    await page.click('button[aria-label="Sign in"]');
    
    // navigate to right page
    await page.waitForSelector('article', {visible: true})
    await page.goto('https://handbook.evidence.app/cloud-funnel/', {
        waitUntil: "networkidle2"
    });

    // generate pdf
    await page.waitForSelector('article', {visible: true})
    await page.setViewport({ width: 1680, height: 1050 });
    await page.pdf({
        path: filename,
        format: "A4"
    });

    await browser.close();
    sendmail();
})();


const fs = require('fs');
const nodemailer = require('nodemailer');

const sendmail = ()=> {

  nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
        service: 'gmail',  
        host: process.env.EMAIL_HOST, // smtp host
          port: 25,
          secure: false,
          auth: {
              user: process.env.EMAIL_USER, //smtp user
              pass: process.env.EMAIL_PASSWORD //smtp password
          }
      });

      let mailOptions = {
          from: 'archie@evidence.dev',
          //to: ['archiewood@outlook.com', 'archie@evidence.md', 'sean@evidence.dev'],
            to: ['archiewood@outlook.com'],
        //   cc: '<emailCC>',
          subject: 'Doormart Daily report' +  ' 🎉',
          text: 'See attached reports from the Evidence Bot',
          html: '<b>See attached reports from Evidence Bot  🎉</b>',
          attachments: [
            {
                filename: filename,
                path: filename,
            }
          ]
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          fs.unlinkSync(filename); // delete file when successful sendmail
          console.log('Message sent: %s', info.messageId);
      });
  });
}