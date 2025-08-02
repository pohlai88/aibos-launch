import { describe, it, expect, beforeEach } from 'vitest'
import { Manifestor } from './engine/Manifestor'
import type { Manifest } from './types/Manifest.types'

describe('Manifestor', () => {
  let manifestor: Manifestor

  beforeEach(() => {
    // Reset the singleton instance for each test
    ;(Manifestor as Record<string, unknown>).instance = undefined
    manifestor = Manifestor.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = Manifestor.getInstance()
      const instance2 = Manifestor.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should create only one instance', () => {
      const instance1 = Manifestor.getInstance()
      const instance2 = Manifestor.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Core Methods', () => {
    it('should have required methods', () => {
      expect(typeof manifestor.loadManifests).toBe('function')
      expect(typeof manifestor.can).toBe('function')
      expect(typeof manifestor.getConfig).toBe('function')
      expect(typeof manifestor.healthCheck).toBe('function')
      expect(typeof manifestor.validate).toBe('function')
    })

    it('should return health check with basic structure', () => {
      const health = manifestor.healthCheck()

      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('timestamp')
      expect(health).toHaveProperty('modules')
      expect(health).toHaveProperty('cache')
      expect(health).toHaveProperty('performance')
      expect(health).toHaveProperty('errors')

      expect(typeof health.status).toBe('string')
      expect(typeof health.timestamp).toBe('string')
      expect(Array.isArray(health.errors)).toBe(true)
    })

    it('should validate manifest structure', () => {
      const validManifest: Manifest = {
        id: 'test-module',
        version: '1.0.0',
        type: 'module',
        enabled: true,
        permissions: {
          read: ['admin'],
          write: ['admin'],
          execute: ['admin'],
        },
        config: {},
        metadata: {},
      }

      const result = manifestor.validate(validManifest)
      expect(result.valid).toBe(true)
      expect(Array.isArray(result.errors)).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should reject invalid manifest', () => {
      const invalidManifest = {
        id: '', // Invalid: empty ID
        version: '1.0.0',
        type: 'module',
        enabled: true,
        permissions: {
          read: ['admin'],
          write: ['admin'],
          execute: ['admin'],
        },
        config: {},
        metadata: {},
      }

      const result = manifestor.validate(invalidManifest as Manifest)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Permission System', () => {
    it('should handle permission checks', () => {
      const user = {
        id: 'test-user',
        roles: ['admin'],
        permissions: [],
      }

      // Test basic permission check (will return false since no manifests loaded)
      const result = manifestor.can('test-resource', 'read', user)
      expect(typeof result).toBe('boolean')
    })

    it('should handle missing user', () => {
      const result = manifestor.can('test-resource', 'read')
      expect(result).toBe(false)
    })
  })

  describe('Configuration Access', () => {
    it('should return null for non-existent module', () => {
      const config = manifestor.getConfig('non-existent-module')
      expect(config).toBeNull()
    })

    it('should return null for manifest by non-existent ID', () => {
      const manifest = manifestor.getManifest('non-existent-module')
      expect(manifest).toBeNull()
    })

    it('should return empty array for modules list initially', () => {
      const modules = manifestor.listModules()
      expect(Array.isArray(modules)).toBe(true)
      expect(modules.length).toBe(0)
    })
  })

  describe('Event System', () => {
    it('should handle subscriptions', () => {
      const callback = (_event: unknown) => {
        // Test callback
      }

      manifestor.subscribe(callback)
      manifestor.unsubscribe(callback)

      // Should not throw errors
      expect(true).toBe(true)
    })
  })

  describe('Metrics and Performance', () => {
    it('should return metrics structure', () => {
      const metrics = manifestor.getMetrics()

      expect(metrics).toHaveProperty('totalPermissionChecks')
      expect(metrics).toHaveProperty('avgPermissionCheckTime')
      expect(metrics).toHaveProperty('totalManifestsLoaded')
      expect(metrics).toHaveProperty('cacheHitRate')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('uptime')

      expect(typeof metrics.totalPermissionChecks).toBe('number')
      expect(typeof metrics.avgPermissionCheckTime).toBe('number')
      expect(typeof metrics.totalManifestsLoaded).toBe('number')
      expect(typeof metrics.cacheHitRate).toBe('number')
      expect(typeof metrics.memoryUsage).toBe('number')
      expect(typeof metrics.uptime).toBe('number')
    })

    it('should return performance stats', () => {
      const stats = manifestor.getPerformanceStats()

      expect(stats).toHaveProperty('loadTime')
      expect(stats).toHaveProperty('permissionCheckTime')
      expect(stats).toHaveProperty('cacheHitRate')
      expect(stats).toHaveProperty('memoryUsage')

      expect(typeof stats.loadTime).toBe('number')
      expect(typeof stats.permissionCheckTime).toBe('number')
      expect(typeof stats.cacheHitRate).toBe('number')
      expect(typeof stats.memoryUsage).toBe('number')
    })
  })
})
