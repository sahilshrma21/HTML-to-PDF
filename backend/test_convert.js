const http = require('http');
const fs = require('fs');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Huntsman Building Solutions - Customer Summary</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: #f3f4f6;
            padding: 40px;
            color: #1f2937;
        }

        .page {
            background: white;
            max-width: 1200px;
            margin: 0 auto 40px;
            padding: 60px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-radius: 8px;
            page-break-after: always;
            position: relative;
        }

        /* Prevent collapsing of key sections */
        .info-section, 
        .support-section, 
        .sales-content, 
        .chart-container,
        .acknowledgement,
        tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 48px;
            padding-bottom: 24px;
            border-bottom: 3px solid #65a30d; /* Lime 600 */
        }

        .logo {
            display: flex;
            flex-direction: column;
        }

        .logo h1 {
            font-size: 32px;
            font-weight: 800;
            color: #166534; /* Green 800 */
            letter-spacing: -0.02em;
            line-height: 1;
            margin-bottom: 4px;
        }

        .logo h2 {
            font-size: 16px;
            color: #854d0e; /* Yellow 800 */
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .title {
            text-align: center;
            flex-grow: 1;
            padding: 0 20px;
        }

        .title h1 {
            font-size: 36px;
            color: #111827;
            font-weight: 300;
            letter-spacing: -0.02em;
        }

        .print-date {
            text-align: right;
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            margin-bottom: 48px;
        }

        .info-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 13px;
            line-height: 1.5;
        }

        .info-label {
            font-weight: 600;
            color: #374151;
            min-width: 120px;
        }

        .info-value {
            color: #111827;
            text-align: right;
            flex: 1;
            font-weight: 400;
        }

        .section-header {
            background: #65a30d;
            color: white;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 48px 0 24px 0;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .sales-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: start;
            margin-bottom: 40px;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 15px; /* Increased from 13px */
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        thead {
            background: #f9fafb;
        }

        th {
            padding: 16px 20px; /* Increased padding */
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            font-size: 15px;
        }

        td {
            padding: 16px 20px; /* Increased padding */
            border-bottom: 1px solid #e5e7eb;
            color: #111827;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tbody tr:last-child {
            font-weight: 700;
            background: #f9fafb;
        }

        .chart-container {
            width: 100%;
            padding: 30px; /* Increased padding */
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }

        .chart-wrapper {
            position: relative;
            height: 450px; /* Increased height */
            width: 100%;
        }

        .support-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 32px;
            font-size: 14px; /* Increased font size */
        }

        .support-header {
            background: #f9fafb;
            padding: 16px; /* Increased padding */
            font-weight: 600;
            font-size: 14px; /* Increased font size */
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
        }

        .support-header:last-child {
            border-right: none;
        }

        .support-title {
            font-weight: 700;
            font-size: 18px; /* Increased size */
            margin-bottom: 16px;
            color: #111827;
            display: flex;
            align-items: center;
        }
        
        .support-title::before {
            content: '';
            display: inline-block;
            width: 6px; /* Thicker accent */
            height: 20px;
            background: #65a30d;
            margin-right: 10px;
            border-radius: 3px;
        }

        .empty-row {
            background: white;
            padding: 32px;
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            font-size: 15px;
            border-top: 1px solid #e5e7eb;
        }

        .acknowledgement {
            margin-top: 64px;
            padding-top: 32px;
            border-top: 2px solid #e5e7eb;
        }

        .acknowledgement-label {
            font-weight: 600;
            margin-bottom: 40px;
            color: #374151;
        }

        .signature-line {
            width: 100%;
            height: 40px;
            border-bottom: 2px solid #111827;
            margin-bottom: 8px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .page {
                box-shadow: none;
                padding: 40px;
                margin: 0;
                max-width: 100%;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>

    <!-- Page 1 -->
    <div class="page">
        <div class="header">
            <div class="logo">
                <h1>HUNTSMAN</h1>
                <h2>BUILDING SOLUTIONS</h2>
            </div>
            <div class="title">
                <h1>Customer Summary</h1>
            </div>
            <div class="print-date">
                Print Date: 2025-10-13
            </div>
        </div>

        <div class="info-grid">
            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">Account:</span>
                    <span class="info-value">AMA Spray Foam Insulation LLC<br>1390 13th St. SW<br>Naples, FL34117</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Terms:</span>
                    <span class="info-value">Net 35</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Avg days to Pay:</span>
                    <span class="info-value"></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Membership:</span>
                    <span class="info-value"></span>
                </div>
            </div>

            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">Primary Contact:</span>
                    <span class="info-value"></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Accounts Payable Contact:</span>
                    <span class="info-value"></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Shipping/Receiving Contact:</span>
                    <span class="info-value"></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Customer Segmentation:</span>
                    <span class="info-value">Residential: 100% (NC 0%, Retro 0%)<br>Commercial: 0%</span>
                </div>
            </div>

            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">HBS Territory MGR:</span>
                    <span class="info-value">Christopher Dulin</span>
                </div>
                <div class="info-row">
                    <span class="info-label">HBS Tech Services Rep:</span>
                    <span class="info-value">Luis Razzetti</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Customer Service:</span>
                    <span class="info-value">HBSCare@huntsmanbuilds.com<br>1-855-742-7227</span>
                </div>
                <div class="info-row">
                    <span class="info-label"># of Proportioners:</span>
                    <span class="info-value">0</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Single Rig:</span>
                    <span class="info-value">0</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dual Rig:</span>
                    <span class="info-value">0</span>
                </div>
            </div>
        </div>

        <div class="section-header">Sales History</div>

        <h3 style="margin-bottom: 20px; font-size: 18px; color: #333;">Sales Volume in LBS</h3>

        <div class="sales-content">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>CY</th>
                            <th>PY YTD</th>
                            <th>Variance</th>
                            <th>PY Full</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>MISC</td>
                            <td>1</td>
                            <td>0</td>
                            <td>1</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>Parts & Equip</td>
                            <td>1</td>
                            <td>0</td>
                            <td>1</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td>2</td>
                            <td>0</td>
                            <td>2</td>
                            <td>0</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="chart-container">
                <div class="chart-wrapper">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 2 -->
    <div class="page">
        <div class="section-header">Sales Support</div>

        <div class="support-section">
            <div class="support-title">Commercial Leads (12 months)</div>
            <div class="support-grid">
                <div class="support-header">City, ST</div>
                <div class="support-header">Architect</div>
                <div class="support-header">Status</div>
                <div class="support-header">Stage</div>
                <div class="support-header">Product</div>
                <div class="support-header">Bid Date</div>
            </div>
            <div class="empty-row">No data available</div>
        </div>

        <div class="support-section">
            <div class="support-title">Construction Project Leads (12 months)</div>
            <div class="support-grid">
                <div class="support-header">City, ST</div>
                <div class="support-header">Architect</div>
                <div class="support-header">Status</div>
                <div class="support-header">Stage</div>
                <div class="support-header">Product</div>
                <div class="support-header">Bid Date</div>
            </div>
            <div class="empty-row">No data available</div>
        </div>

        <div class="support-section">
            <div class="support-title">Issue Resolution (Last 12 months):</div>
            <div class="support-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="support-header">CAR Issue</div>
                <div class="support-header">Date Resolved</div>
                <div class="support-header">Resolution</div>
            </div>
            <div class="empty-row">No issues reported</div>
        </div>

        <div class="support-section">
            <div class="support-title">Technical Visits (Last 12 months):</div>
            <div class="support-grid" style="grid-template-columns: repeat(2, 1fr) 2fr;">
                <div class="support-header">TSR</div>
                <div class="support-header">Date of Visit</div>
                <div class="support-header">Description</div>
            </div>
            <div class="empty-row">No technical visits recorded</div>
        </div>

        <div class="section-header">Affiliations</div>
        <div class="support-grid" style="grid-template-columns: 1fr 1fr 2fr;">
            <div class="support-header">Name</div>
            <div class="support-header">Type</div>
            <div class="support-header">Comments</div>
        </div>
        <div class="empty-row">No affiliations</div>

        <div class="section-header">Targets</div>
        <div class="support-grid" style="grid-template-columns: 1fr 1fr 2fr;">
            <div class="support-header">Name</div>
            <div class="support-header">Type</div>
            <div class="support-header">Comments</div>
        </div>
        <div class="empty-row">No targets set</div>

        <div class="acknowledgement">
            <div class="acknowledgement-label">Acknowledgement:</div>
            <div class="signature-line"></div>
        </div>
    </div>

    <script>
        // Wait for Chart.js to load
        function initializeChart() {
            const ctx = document.getElementById('salesChart');
            if (!ctx || typeof Chart === 'undefined') {
                console.log('Waiting for Chart.js...');
                setTimeout(initializeChart, 100);
                return;
            }

            const salesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['MISC', 'Parts & Equip'],
                    datasets: [
                        {
                            label: 'CY',
                            data: [1, 1],
                            backgroundColor: '#00BFFF',
                            borderColor: '#00BFFF',
                            borderWidth: 1
                        },
                        {
                            label: 'PY',
                            data: [0, 0],
                            backgroundColor: '#003366',
                            borderColor: '#003366',
                            borderWidth: 1
                        },
                        {
                            label: 'PY Full',
                            data: [0, 0],
                            backgroundColor: '#66CCFF',
                            borderColor: '#66CCFF',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Disable animation for faster printing
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Pounds',
                                font: {
                                    size: 12
                                }
                            },
                            ticks: {
                                stepSize: 0.2
                            },
                            max: 1.0
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            align: 'end',
                            labels: {
                                boxWidth: 15,
                                padding: 15,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y + ' lbs';
                                }
                            }
                        }
                    }
                }
            });

            console.log('Chart initialized successfully');
            
            // Notify that chart is ready
            window.chartReady = true;
        }

        // Start initialization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeChart);
        } else {
            initializeChart();
        }
    </script>
</body>
</html>
`;

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/convert',
    method: 'POST',
    headers: {
        'Content-Type': 'text/html',
        'Content-Length': Buffer.byteLength(htmlContent)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    if (res.statusCode === 200) {
        const file = fs.createWriteStream('output.pdf');
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('PDF downloaded to output.pdf');
        });
    } else {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(htmlContent);
req.end();
