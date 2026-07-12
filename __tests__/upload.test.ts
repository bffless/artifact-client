import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as http from 'http';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
}));

import { requestPrepareBatchUpload, finalizeUpload } from '../src/upload';
import { PrepareBatchUploadResponse, UploadResponse } from '../src/types';

describe('requestPrepareBatchUpload / finalizeUpload — plural proxy rule set serialization', () => {
  let server: http.Server;
  let serverPort: number;
  let receivedBody: string;
  let receivedUrl: string | undefined;

  const mockPrepareResponse: PrepareBatchUploadResponse = {
    presignedUrlsSupported: true,
    uploadToken: 'token-123',
  };

  const mockFinalizeResponse: UploadResponse = {
    deploymentId: 'deploy-123',
    repository: 'test-owner/test-repo',
    commitSha: 'abc123',
    branch: 'main',
    fileCount: 5,
    totalSize: 12345,
    aliases: ['production'],
    urls: {},
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    receivedBody = '';
    receivedUrl = undefined;

    server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        receivedBody = Buffer.concat(chunks).toString();
        receivedUrl = req.url;

        const isFinalize = req.url === '/api/deployments/finalize-upload';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(isFinalize ? mockFinalizeResponse : mockPrepareResponse));
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          serverPort = addr.port;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe('requestPrepareBatchUpload', () => {
    const baseRequest = {
      repository: 'test-owner/test-repo',
      commitSha: 'abc123',
      files: [],
    };

    it('sends an array as-is (real JSON array, not a joined string)', async () => {
      await requestPrepareBatchUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetNames: ['a', 'b'],
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetNames).toEqual(['a', 'b']);
      expect(receivedBody).not.toContain('"a,b"');
    });

    it('normalizes a legacy comma-separated string into an array', async () => {
      await requestPrepareBatchUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetNames: 'a,b',
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetNames).toEqual(['a', 'b']);
    });

    it('normalizes a single value string into a one-element array', async () => {
      await requestPrepareBatchUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetNames: 'solo',
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetNames).toEqual(['solo']);
    });

    it('omits the key entirely when not provided', async () => {
      await requestPrepareBatchUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed).not.toHaveProperty('proxyRuleSetNames');
    });

    it('normalizes proxyRuleSetIds the same way', async () => {
      await requestPrepareBatchUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetIds: 'id-a,id-b',
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetIds).toEqual(['id-a', 'id-b']);
    });
  });

  describe('finalizeUpload', () => {
    const baseRequest = {
      uploadToken: 'token-123',
    };

    it('sends an array as-is (real JSON array, not a joined string)', async () => {
      await finalizeUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetNames: ['a', 'b'],
      });

      expect(receivedUrl).toBe('/api/deployments/finalize-upload');
      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetNames).toEqual(['a', 'b']);
      expect(receivedBody).not.toContain('"a,b"');
    });

    it('normalizes a legacy comma-separated string into an array', async () => {
      await finalizeUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetNames: 'a,b',
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetNames).toEqual(['a', 'b']);
    });

    it('normalizes a single value string into a one-element array', async () => {
      await finalizeUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetNames: 'solo',
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetNames).toEqual(['solo']);
    });

    it('omits the key entirely when not provided', async () => {
      await finalizeUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed).not.toHaveProperty('proxyRuleSetNames');
    });

    it('normalizes proxyRuleSetIds the same way', async () => {
      await finalizeUpload(`http://localhost:${serverPort}`, 'test-key', {
        ...baseRequest,
        proxyRuleSetIds: 'id-a,id-b',
      });

      const parsed = JSON.parse(receivedBody);
      expect(parsed.proxyRuleSetIds).toEqual(['id-a', 'id-b']);
    });
  });
});
