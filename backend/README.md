# HTML to PDF Conversion Service

This is a standalone backend service that converts HTML content into a PDF file using Puppeteer.

## API Usage

### Endpoint
`POST /convert`

### Headers
- `Content-Type`: `text/html`

### Body
The raw HTML string you want to convert.

### Response
- **Success**: Returns a PDF file stream with `Content-Type: application/pdf`.
- **Error**: Returns a 400 or 500 error message.

## Examples

### 1. Using cURL
```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: text/html" \
  -d "<h1>Hello World</h1><p>This is a test PDF.</p>" \
  --output result.pdf
```

### 2. Using JavaScript (Fetch API)
```javascript
const html = `
  <html>
    <body>
      <h1>Invoice</h1>
      <p>Total: $100</p>
    </body>
  </html>
`;

fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/html',
  },
  body: html
})
.then(response => {
  if (response.ok) return response.blob();
  throw new Error('Network response was not ok.');
})
.then(blob => {
  // Create a link to download the PDF
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "downloaded_file.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
})
.catch(error => console.error('Error:', error));
```

### 3. Using Python (requests)
```python
import requests

html_content = "<h1>Hello from Python</h1>"
url = "http://localhost:3000/convert"

response = requests.post(
    url, 
    data=html_content, 
    headers={"Content-Type": "text/html"}
)

if response.status_code == 200:
    with open("output.pdf", "wb") as f:
        f.write(response.content)
    print("PDF saved successfully.")
else:
    print(f"Error: {response.text}")
```

## Deployment
Deploy this folder to any Node.js hosting provider (Heroku, Railway, Render, AWS, etc.).
Ensure `puppeteer` dependencies are met in the environment (most providers have buildpacks for this).
