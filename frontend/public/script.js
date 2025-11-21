document.addEventListener('DOMContentLoaded', () => {
    const htmlInput = document.getElementById('htmlInput');
    const previewBtn = document.getElementById('previewBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const emptyState = document.getElementById('emptyState');
    const loadingSpinner = document.getElementById('loadingSpinner');

    let currentPdfBlob = null;

    // Default HTML template (Professional Structure)
    const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Huntsman Building Solutions</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: 'Inter', sans-serif; background: #f3f4f6; padding: 40px; color: #1f2937; }
        .page { background: white; max-width: 1200px; margin: 0 auto; padding: 60px; border-radius: 8px; position: relative; }
        
        /* Structure Preservation */
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; border-bottom: 3px solid #65a30d; padding-bottom: 24px; }
        .logo h1 { font-size: 32px; font-weight: 800; color: #166534; margin-bottom: 4px; }
        .logo h2 { font-size: 16px; color: #854d0e; font-weight: 600; text-transform: uppercase; }
        .title h1 { font-size: 36px; font-weight: 300; }
        
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-bottom: 48px; }
        .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px; }
        .info-label { font-weight: 600; color: #374151; }
        
        .section-header { background: #65a30d; color: white; padding: 12px 24px; font-weight: 700; text-transform: uppercase; margin: 48px 0 24px; border-radius: 6px; }
        
        /* Original Grid Structure */
        .sales-content { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; margin-bottom: 40px; }
        
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 8px; }
        th, td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: left; }
        thead { background: #f9fafb; }
        th { font-weight: 600; color: #374151; }
        
        .chart-container { padding: 20px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; height: 400px; }
        
        .support-grid { display: grid; grid-template-columns: repeat(6, 1fr); border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 32px; font-size: 13px; }
        .support-header { background: #f9fafb; padding: 12px; font-weight: 600; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        .empty-row { grid-column: span 6; padding: 24px; text-align: center; color: #9ca3af; font-style: italic; }
        
        @media print {
            body { background: white; padding: 0; }
            .page { padding: 40px; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="logo">
                <h1>HUNTSMAN</h1>
                <h2>BUILDING SOLUTIONS</h2>
            </div>
            <div class="title"><h1>Customer Summary</h1></div>
            <div class="print-date">Print Date: 2025-10-13</div>
        </div>

        <div class="info-grid">
            <div class="info-section">
                <div class="info-row"><span class="info-label">Account:</span><span>AMA Spray Foam</span></div>
                <div class="info-row"><span class="info-label">Terms:</span><span>Net 35</span></div>
            </div>
            <div class="info-section">
                <div class="info-row"><span class="info-label">Primary Contact:</span><span>-</span></div>
            </div>
            <div class="info-section">
                <div class="info-row"><span class="info-label">Territory MGR:</span><span>Christopher Dulin</span></div>
            </div>
        </div>

        <div class="section-header">Sales History</div>
        <div class="sales-content">
            <table>
                <thead><tr><th>Product</th><th>CY</th><th>PY</th></tr></thead>
                <tbody>
                    <tr><td>MISC</td><td>1</td><td>0</td></tr>
                    <tr><td>Parts</td><td>1</td><td>0</td></tr>
                    <tr><td>Total</td><td>2</td><td>0</td></tr>
                </tbody>
            </table>
            <div class="chart-container">
                <canvas id="salesChart"></canvas>
            </div>
        </div>
        
        <div class="section-header">Sales Support</div>
        <div class="support-grid">
            <div class="support-header">City</div><div class="support-header">Architect</div><div class="support-header">Status</div>
            <div class="support-header">Stage</div><div class="support-header">Product</div><div class="support-header">Date</div>
            <div class="empty-row">No data available</div>
        </div>
    </div>
    <script>
        const ctx = document.getElementById('salesChart');
        if(ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['MISC', 'Parts'],
                    datasets: [{ label: 'CY', data: [1, 1], backgroundColor: '#0ea5e9' }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    </script>
</body>
</html>`;

    htmlInput.value = defaultHtml;

    previewBtn.addEventListener('click', async () => {
        const htmlContent = htmlInput.value;
        if (!htmlContent.trim()) return;

        // UI State
        loadingSpinner.classList.remove('hidden');
        previewBtn.disabled = true;
        emptyState.classList.add('hidden');

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'text/html' },
                body: htmlContent
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            currentPdfBlob = blob;

            const url = URL.createObjectURL(blob);
            pdfPreview.src = url;

            downloadBtn.disabled = false;
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate PDF preview');
        } finally {
            loadingSpinner.classList.add('hidden');
            previewBtn.disabled = false;
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (currentPdfBlob) {
            const url = URL.createObjectURL(currentPdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
});
