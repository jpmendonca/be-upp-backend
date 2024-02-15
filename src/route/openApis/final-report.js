const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();
const { addFinalReportTemplate, getFinalReportDataByDoctor } =
  require('../../service/final-report');
const { clone, responseError } = require('../../service/helper');


router.post('/new', async(req, res) => {
  try {
    const data = clone(req.body);
    const fr = await addFinalReportTemplate(data);

    res.send(fr._id);
  } catch (error) {
    console.log(error);
    responseError(res, error);
  }
});

router.get('/finalReportByDoctor', async(req, res) => {
  try {
    const doctorId = req.query ? req.query.doctorId : false;
    if (!doctorId) {
      throw Object.assign(
        new Error('Ausência de valores (requerido: doctorId)'),
        { code: 402 },
      );
    }
    console.log('ID -> ', doctorId);

    const frData = await getFinalReportDataByDoctor(doctorId);

    res.send(frData);
  } catch (error) {
    console.log(error);
    // TODO error
    res.status(error.code).send(error.message);
  }
});

router.get('/reportColab', async(req, res) => {
  (async() => {
    // Create a browser instance
    const browser = await puppeteer.launch({ args:
      ['--no-sandbox', '--disable-setuid-sandbox'] });

    // Create a new page
    const page = await browser.newPage();

    // Website URL to export as pdf
    const website_url = 'https://www.google.com.br';

    // Open URL in current page
    await page.goto(website_url, { waitUntil: 'networkidle0' });

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    // Downlaod the PDF
    await page.pdf({
      path: 'result3.pdf',
      margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
      printBackground: true,
      format: 'A4',
    });

    // Close the browser instance
    await browser.close();
  })();
});

module.exports = router;
