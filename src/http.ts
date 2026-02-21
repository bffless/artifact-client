import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

/**
 * POST JSON to an API endpoint
 */
export async function postJson<T>(url: URL, body: unknown, apiKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const transport = url.protocol === 'https:' ? https : http;

    const req = transport.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
          'X-API-Key': apiKey,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const responseBody = Buffer.concat(chunks).toString('utf-8');

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(responseBody) as T;
              resolve(parsed);
            } catch {
              reject(new Error(`Failed to parse response: ${responseBody.substring(0, 200)}`));
            }
          } else {
            reject(
              new Error(
                `API request failed: HTTP ${res.statusCode} - ${responseBody.substring(0, 500)}`,
              ),
            );
          }
        });
      },
    );

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}
