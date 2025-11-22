const express = require('express');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and raw body
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ type: 'text/html', limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('HTML to PDF Service is running. POST HTML to /convert to generate PDF.');
});

/**
 * POST /convert
 * Body: HTML string
 * Returns: PDF buffer
 */
app.post('/convert', async (req, res) => {
    try {
        const htmlContent = req.body;

        if (!htmlContent || typeof htmlContent !== 'string') {
            return res.status(400).send('Invalid HTML content. Please send HTML string in the body.');
        }

        let browser;

        if (process.env.VERCEL) {
            // Production (Vercel) configuration
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            // Local development configuration
            // We dynamically require 'puppeteer' here to avoid errors in production where it's not installed
            const puppeteerLocal = require('puppeteer');
            browser = await puppeteerLocal.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

        const page = await browser.newPage();

        // Set content and wait for network idle to ensure assets load
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Important for styles/colors
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': 'attachment; filename="output.pdf"'
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            error: 'Error converting HTML to PDF',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
