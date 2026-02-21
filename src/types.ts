// ============================================================================
// Download Types
// ============================================================================

export interface DownloadFileInfo {
  path: string;
  size: number;
  downloadUrl: string;
}

export interface PrepareBatchDownloadRequest {
  repository: string;
  path: string;
  alias?: string;
  commitSha?: string;
  branch?: string;
}

export interface PrepareBatchDownloadResponse {
  presignedUrlsSupported: boolean;
  commitSha: string;
  isPublic?: boolean;
  files: DownloadFileInfo[];
}

export interface DownloadResult {
  success: string[];
  failed: Array<{ path: string; error: string }>;
}

// ============================================================================
// Upload Types
// ============================================================================

export interface FileInfo {
  absolutePath: string;
  relativePath: string;
  size: number;
  contentType: string;
}

export interface BatchUploadFile {
  path: string;
  size: number;
  contentType: string;
}

export interface PrepareBatchUploadRequest {
  repository: string;
  commitSha: string;
  branch?: string;
  alias?: string;
  basePath?: string;
  description?: string;
  tags?: string;
  proxyRuleSetName?: string;
  proxyRuleSetId?: string;
  files: BatchUploadFile[];
}

export interface PresignedUrlInfo {
  path: string;
  presignedUrl: string;
  storageKey: string;
}

export interface PrepareBatchUploadResponse {
  presignedUrlsSupported: boolean;
  uploadToken?: string;
  expiresAt?: string;
  files?: PresignedUrlInfo[];
}

export interface FinalizeUploadRequest {
  uploadToken: string;
}

export interface DeploymentUrls {
  sha?: string;
  alias?: string;
  preview?: string;
  branch?: string;
}

export interface UploadResponse {
  deploymentId: string;
  repository?: string;
  commitSha: string;
  branch?: string;
  fileCount: number;
  totalSize: number;
  aliases?: string[];
  urls: DeploymentUrls;
}

export interface UploadResult {
  success: string[];
  failed: Array<{ path: string; error: string }>;
}
