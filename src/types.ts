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
  /** @deprecated prefer proxyRuleSetNames */
  proxyRuleSetName?: string;
  /** @deprecated prefer proxyRuleSetIds */
  proxyRuleSetId?: string;
  /**
   * Proxy rule set names to attach to the deployed alias. Arrays are sent as-is;
   * a comma-separated string is accepted for back-compat and normalized.
   * Echoed on finalize-upload — the values used there are authoritative.
   */
  proxyRuleSetNames?: string[] | string;
  /**
   * Proxy rule set IDs to attach to the deployed alias. Arrays are sent as-is;
   * a comma-separated string is accepted for back-compat and normalized.
   * Echoed on finalize-upload — the values used there are authoritative.
   */
  proxyRuleSetIds?: string[] | string;
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
  /** @deprecated prefer proxyRuleSetNames */
  proxyRuleSetName?: string;
  /** @deprecated prefer proxyRuleSetIds */
  proxyRuleSetId?: string;
  /**
   * Proxy rule set names to attach to the deployed alias. Arrays are sent as-is;
   * a comma-separated string is accepted for back-compat and normalized.
   * Appended idempotently. Overrides any value carried over from prepare-batch-upload.
   */
  proxyRuleSetNames?: string[] | string;
  /**
   * Proxy rule set IDs to attach to the deployed alias. Arrays are sent as-is;
   * a comma-separated string is accepted for back-compat and normalized.
   * Appended idempotently. Overrides any value carried over from prepare-batch-upload.
   */
  proxyRuleSetIds?: string[] | string;
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
