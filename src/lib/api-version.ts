/**
 * API Versioning Utility
 *
 * Current API version: v1 (implicit)
 * All routes under /api/* are considered v1
 *
 * Future versions should be explicitly versioned:
 * - /api/v2/transactions
 * - /api/v3/accounts
 *
 * Migration strategy:
 * 1. Create new version directory (e.g., /api/v2/)
 * 2. Copy or create new route handlers
 * 3. Deprecate old version with warnings
 * 4. Remove old version after grace period
 */

export const CURRENT_API_VERSION = 'v1' as const
export const SUPPORTED_API_VERSIONS = ['v1'] as const

export type ApiVersion = typeof SUPPORTED_API_VERSIONS[number]

/**
 * API version header name
 */
export const API_VERSION_HEADER = 'X-API-Version'

/**
 * Get API version from request headers
 */
export function getApiVersion(headers: Headers): ApiVersion {
  const versionHeader = headers.get(API_VERSION_HEADER)

  if (versionHeader && SUPPORTED_API_VERSIONS.includes(versionHeader as ApiVersion)) {
    return versionHeader as ApiVersion
  }

  return CURRENT_API_VERSION
}

/**
 * Check if API version is supported
 */
export function isVersionSupported(version: string): boolean {
  return SUPPORTED_API_VERSIONS.includes(version as ApiVersion)
}

/**
 * Add API version headers to response
 */
export function addVersionHeaders(headers: Headers, version: ApiVersion = CURRENT_API_VERSION): Headers {
  headers.set(API_VERSION_HEADER, version)
  headers.set('X-API-Supported-Versions', SUPPORTED_API_VERSIONS.join(', '))
  return headers
}

/**
 * Deprecation notice for old API versions
 */
export interface DeprecationInfo {
  version: ApiVersion
  deprecatedAt: string
  sunsetAt: string
  message: string
}

export const DEPRECATED_VERSIONS: DeprecationInfo[] = [
  // Example (no deprecated versions yet):
  // {
  //   version: 'v1',
  //   deprecatedAt: '2025-01-01',
  //   sunsetAt: '2025-06-01',
  //   message: 'API v1 is deprecated. Please upgrade to v2.',
  // },
]

/**
 * Get deprecation info for a version
 */
export function getDeprecationInfo(version: ApiVersion): DeprecationInfo | null {
  return DEPRECATED_VERSIONS.find(d => d.version === version) || null
}

/**
 * Add deprecation warning headers if version is deprecated
 */
export function addDeprecationHeaders(headers: Headers, version: ApiVersion): Headers {
  const deprecation = getDeprecationInfo(version)

  if (deprecation) {
    headers.set('Deprecation', 'true')
    headers.set('Sunset', deprecation.sunsetAt)
    headers.set('Warning', `299 - "${deprecation.message}"`)
  }

  return headers
}
