# @bffless/artifact-client

Shared API client for BFFLESS artifact upload and download operations.

## Installation

```bash
npm install @bffless/artifact-client
# or
pnpm add @bffless/artifact-client
```

## Usage

### Download artifacts

```typescript
import {
  requestPrepareBatchDownload,
  downloadFilesWithPresignedUrls,
  downloadFilesDirect,
} from '@bffless/artifact-client';

// Request download manifest
const response = await requestPrepareBatchDownload(apiUrl, apiKey, {
  repository: 'owner/repo',
  path: 'coverage',
  alias: 'latest', // or commitSha, branch
});

// Download files
let result;
if (response.presignedUrlsSupported) {
  result = await downloadFilesWithPresignedUrls(response.files, outputDir);
} else {
  result = await downloadFilesDirect(apiUrl, apiKey, response.files, outputDir, {
    repository: 'owner/repo',
    alias: 'latest',
  });
}

console.log(`Downloaded ${result.success.length} files`);
```

### Upload artifacts

```typescript
import {
  requestPrepareBatchUpload,
  uploadFilesWithPresignedUrls,
  finalizeUpload,
} from '@bffless/artifact-client';
import type { FileInfo, BatchUploadFile } from '@bffless/artifact-client';

// Prepare file list
const files: FileInfo[] = [
  {
    absolutePath: '/path/to/file.js',
    relativePath: 'file.js',
    size: 1234,
    contentType: 'application/javascript',
  },
];

const batchFiles: BatchUploadFile[] = files.map((f) => ({
  path: f.relativePath,
  size: f.size,
  contentType: f.contentType,
}));

// Request presigned URLs
const response = await requestPrepareBatchUpload(apiUrl, apiKey, {
  repository: 'owner/repo',
  commitSha: 'abc123',
  branch: 'main',
  files: batchFiles,
});

if (response.presignedUrlsSupported && response.files && response.uploadToken) {
  // Upload files directly to storage
  const filesToUpload = files.map((file, i) => ({
    file,
    presignedUrl: response.files![i].presignedUrl,
  }));

  const result = await uploadFilesWithPresignedUrls(filesToUpload);
  console.log(`Uploaded ${result.success.length} files`);

  // Finalize the upload
  const finalResponse = await finalizeUpload(apiUrl, apiKey, {
    uploadToken: response.uploadToken,
  });
  console.log(`Deployment ID: ${finalResponse.deploymentId}`);
}
```

## API Reference

### Download Functions

| Function                         | Description                                   |
| -------------------------------- | --------------------------------------------- |
| `requestPrepareBatchDownload`    | Request download manifest with presigned URLs |
| `downloadFilesWithPresignedUrls` | Download files using presigned URLs           |
| `downloadFilesDirect`            | Download files through the API (fallback)     |
| `downloadFileFromPresignedUrl`   | Download a single file from presigned URL     |
| `downloadFileDirect`             | Download a single file through the API        |

### Upload Functions

| Function                       | Description                           |
| ------------------------------ | ------------------------------------- |
| `requestPrepareBatchUpload`    | Request presigned URLs for upload     |
| `uploadFilesWithPresignedUrls` | Upload files using presigned URLs     |
| `uploadFileToPresignedUrl`     | Upload a single file to presigned URL |
| `finalizeUpload`               | Finalize a batch upload               |

### Types

```typescript
// Download types
interface PrepareBatchDownloadRequest {
  repository: string;
  path: string;
  alias?: string;
  commitSha?: string;
  branch?: string;
}

interface PrepareBatchDownloadResponse {
  presignedUrlsSupported: boolean;
  commitSha: string;
  isPublic?: boolean;
  files: DownloadFileInfo[];
}

// Upload types
interface PrepareBatchUploadRequest {
  repository: string;
  commitSha: string;
  branch?: string;
  alias?: string;
  basePath?: string;
  files: BatchUploadFile[];
}

interface PrepareBatchUploadResponse {
  presignedUrlsSupported: boolean;
  uploadToken?: string;
  files?: PresignedUrlInfo[];
}

// See src/types.ts for complete type definitions
```

## License

See [LICENSE.md](LICENSE.md)
