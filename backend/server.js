const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and raw body
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ type: 'text/html', limit: '50mb' }));
// app.use(express.static('public')); // Frontend is now separate
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

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
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
        res.status(500).send('Error converting HTML to PDF');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
