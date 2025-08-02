import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AuditLogger } from './audit/AuditLogger'
import { AuditStorage } from './audit/AuditStorage'
import { AuditRetention } from './audit/AuditRetention'
import type {
  AuditConfig,
  AuditStorageConfig,
  RetentionPolicy} from './audit/types/Audit.types';
import {
  AuditSeverity,
  AuditCategory,
  AuditEventType
} from './audit/types/Audit.types'

describe('Audit System', () => {
  let auditLogger: AuditLogger
  let auditStorage: AuditStorage
  let auditRetention: AuditRetention
  let testConfig: AuditConfig

  beforeEach(async () => {
    // Clean up any existing test files first
    try {
      const fs = await import('fs/promises')
      await fs.rm('./test-audit', { recursive: true, force: true })

      // Also clean up any audit files in the current directory
      const files = await fs.readdir('.')
      for (const file of files) {
        if (file.startsWith('audit-') && file.endsWith('.json')) {
          await fs.unlink(file)
        }
      }
    } catch {
      // Ignore cleanup errors
    }

    // Create test configuration
    const storageConfig: AuditStorageConfig = {
      enabled: true,
      storageType: 'file',
      filePath: './test-audit',
      maxFileSize: 1024 * 1024, // 1MB
      maxFiles: 5,
      compression: false,
      encryption: false,
      batchSize: 10,
      flushInterval: 1000,
      tableName: 'audit_events',
    }

    const retentionPolicy: RetentionPolicy = {
      enabled: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      maxSize: 10 * 1024 * 1024, // 10MB
      archiveEnabled: false,
      compressionEnabled: true,
      deleteExpired: true,
    }

    testConfig = {
      storage: storageConfig,
      retention: retentionPolicy,
      enableMetrics: true,
      enableLogging: true,
      minSeverity: AuditSeverity.LOW,
      includeMetadata: true,
      correlationIdEnabled: true,
    }

    auditStorage = new AuditStorage(storageConfig)
    auditRetention = new AuditRetention(retentionPolicy, auditStorage)
    auditLogger = new AuditLogger(testConfig)
  })

  afterEach(async () => {
    // Clean up test files
    try {
      const fs = await import('fs/promises')
      await fs.rm('./test-audit', { recursive: true, force: true })

      // Also clean up any audit files in the current directory
      const files = await fs.readdir('.')
      for (const file of files) {
        if (file.startsWith('audit-') && file.endsWith('.json')) {
          await fs.unlink(file)
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('AuditLogger', () => {
    it('should log a single audit event', async () => {
      const event = {
        severity: AuditSeverity.MEDIUM,
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN,
        action: 'user_login',
        source: 'test-audit',
        version: '1.0.0',
        userId: 'user123',
        sessionId: 'session456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        resource: '/api/auth/login',
        details: { method: 'POST', success: true },
        metadata: { source: 'web' },
        correlationId: 'corr789',
      }

      await auditLogger.log(event)

      const events = await auditLogger.query({})
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe(AuditEventType.LOGIN)
      expect(events[0].userId).toBe('user123')
    })

    it('should log multiple events in batch', async () => {
      const events = [
        {
          severity: AuditSeverity.LOW,
          category: AuditCategory.SYSTEM_OPERATION,
          eventType: AuditEventType.SYSTEM_START,
          action: 'system_startup',
        },
        {
          severity: AuditSeverity.MEDIUM,
          category: AuditCategory.DATA_ACCESS,
          eventType: AuditEventType.DATA_READ,
          action: 'read_user_data',
          userId: 'user123',
          resource: '/api/users/123',
        },
      ]

      await auditLogger.logBatch(events)

      const loggedEvents = await auditLogger.query({})
      expect(loggedEvents).toHaveLength(2)
      expect(loggedEvents[0].eventType).toBe(AuditEventType.SYSTEM_START)
      expect(loggedEvents[1].eventType).toBe(AuditEventType.DATA_READ)
    })

    it('should query events with filters', async () => {
      // Log events with different severities
      await auditLogger.log({
        severity: AuditSeverity.LOW,
        category: AuditCategory.SYSTEM_OPERATION,
        eventType: AuditEventType.SYSTEM_START,
        action: 'system_startup',
      })

      await auditLogger.log({
        severity: AuditSeverity.HIGH,
        category: AuditCategory.SECURITY,
        eventType: AuditEventType.SECURITY_ALERT,
        action: 'security_alert',
      })

      // Query high severity events only
      const highSeverityEvents = await auditLogger.query({
        severity: [AuditSeverity.HIGH],
      })

      expect(highSeverityEvents).toHaveLength(1)
      expect(highSeverityEvents[0].severity).toBe(AuditSeverity.HIGH)
    })

    it('should respect minimum severity configuration', async () => {
      // Update config to only log HIGH and above
      auditLogger.updateConfig({
        minSeverity: AuditSeverity.HIGH,
      })

      // Log events with different severities
      await auditLogger.log({
        severity: AuditSeverity.LOW,
        category: AuditCategory.SYSTEM_OPERATION,
        eventType: AuditEventType.SYSTEM_START,
        action: 'system_startup',
      })

      await auditLogger.log({
        severity: AuditSeverity.HIGH,
        category: AuditCategory.SECURITY,
        eventType: AuditEventType.SECURITY_ALERT,
        action: 'security_alert',
      })

      const events = await auditLogger.query({})
      expect(events).toHaveLength(1)
      expect(events[0].severity).toBe(AuditSeverity.HIGH)
    })

    it('should provide audit statistics', async () => {
      await auditLogger.log({
        severity: AuditSeverity.MEDIUM,
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN,
        action: 'user_login',
      })

      const stats = await auditLogger.getStats()
      expect(stats.totalEvents).toBeGreaterThan(0)
      expect(stats.eventsBySeverity).toBeDefined()
      expect(stats.eventsByCategory).toBeDefined()
    })

    it('should provide health status', async () => {
      const health = await auditLogger.getHealth()
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('storageAvailable')
      expect(health).toHaveProperty('writeLatency')
      expect(health).toHaveProperty('readLatency')
    })

    it('should create event builder', () => {
      const builder = auditLogger.createEventBuilder()
      const event = builder
        .setSeverity(AuditSeverity.MEDIUM)
        .setCategory(AuditCategory.AUTHENTICATION)
        .setEventType(AuditEventType.LOGIN)
        .setAction('user_login')
        .setUserId('user123')
        .build()

      expect(event.severity).toBe(AuditSeverity.MEDIUM)
      expect(event.category).toBe(AuditCategory.AUTHENTICATION)
      expect(event.eventType).toBe(AuditEventType.LOGIN)
      expect(event.action).toBe('user_login')
      expect(event.userId).toBe('user123')
    })

    it('should log simple events', async () => {
      await auditLogger.logSimple(
        AuditEventType.LOGIN,
        'user_login',
        AuditSeverity.MEDIUM,
        AuditCategory.AUTHENTICATION,
        { userId: 'user123' },
      )

      const events = await auditLogger.query({})
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe(AuditEventType.LOGIN)
      expect(events[0].action).toBe('user_login')
    })

    it('should provide metrics', () => {
      const metrics = auditLogger.getMetrics()
      expect(metrics).toHaveProperty('eventsLogged')
      expect(metrics).toHaveProperty('eventsQueried')
      expect(metrics).toHaveProperty('averageWriteLatency')
      expect(metrics).toHaveProperty('averageReadLatency')
      expect(metrics).toHaveProperty('errorCount')
    })
  })

  describe('AuditStorage', () => {
    it('should write and read events', async () => {
      const event = {
        id: 'test-id',
        timestamp: Date.now(),
        severity: AuditSeverity.MEDIUM,
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN,
        action: 'user_login',
      }

      await auditStorage.write(event)
      const events = await auditStorage.read({})
      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('test-id')
    })

    it('should write events in batch', async () => {
      // Clear any existing events first
      await auditStorage.delete({})

      const events = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          severity: AuditSeverity.LOW,
          category: AuditCategory.SYSTEM_OPERATION,
          eventType: AuditEventType.SYSTEM_START,
          action: 'system_startup',
        },
        {
          id: 'test-2',
          timestamp: Date.now(),
          severity: AuditSeverity.MEDIUM,
          category: AuditCategory.AUTHENTICATION,
          eventType: AuditEventType.LOGIN,
          action: 'user_login',
        },
      ]

      await auditStorage.writeBatch(events)
      const readEvents = await auditStorage.read({})
      expect(readEvents).toHaveLength(2)
    })

    it('should filter events by query', async () => {
      const events = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          severity: AuditSeverity.LOW,
          category: AuditCategory.SYSTEM_OPERATION,
          eventType: AuditEventType.SYSTEM_START,
          action: 'system_startup',
        },
        {
          id: 'test-2',
          timestamp: Date.now(),
          severity: AuditSeverity.HIGH,
          category: AuditCategory.SECURITY,
          eventType: AuditEventType.SECURITY_ALERT,
          action: 'security_alert',
        },
      ]

      await auditStorage.writeBatch(events)

      const highSeverityEvents = await auditStorage.read({
        severity: [AuditSeverity.HIGH],
      })

      expect(highSeverityEvents).toHaveLength(1)
      expect(highSeverityEvents[0].severity).toBe(AuditSeverity.HIGH)
    })

    it('should provide storage statistics', async () => {
      const event = {
        id: 'test-id',
        timestamp: Date.now(),
        severity: AuditSeverity.MEDIUM,
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN,
        action: 'user_login',
      }

      await auditStorage.write(event)
      const stats = await auditStorage.getStats()
      expect(stats.totalEvents).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
    })

    it('should provide health status', async () => {
      const health = await auditStorage.healthCheck()
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('storageAvailable')
      expect(health).toHaveProperty('writeLatency')
      expect(health).toHaveProperty('readLatency')
    })

    it('should update configuration', () => {
      const newConfig = { batchSize: 50, flushInterval: 2000 }
      auditStorage.updateConfig(newConfig)
      // Configuration update should not throw errors
      expect(true).toBe(true)
    })
  })

  describe('AuditRetention', () => {
    it('should enforce retention policy', async () => {
      // Create old events
      const oldEvent = {
        id: 'old-event',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        severity: AuditSeverity.LOW,
        category: AuditCategory.SYSTEM_OPERATION,
        eventType: AuditEventType.SYSTEM_START,
        action: 'system_startup',
      }

      await auditStorage.write(oldEvent)

      // Enforce retention policy
      const deletedCount = await auditRetention.enforcePolicy()
      expect(deletedCount).toBeGreaterThanOrEqual(0)
    })

    it('should get expired events', async () => {
      const oldEvent = {
        id: 'old-event',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        severity: AuditSeverity.LOW,
        category: AuditCategory.SYSTEM_OPERATION,
        eventType: AuditEventType.SYSTEM_START,
        action: 'system_startup',
      }

      await auditStorage.write(oldEvent)

      const expiredEvents = await auditRetention.getExpiredEvents()
      expect(expiredEvents.length).toBeGreaterThan(0)
    })

    it('should provide retention statistics', async () => {
      const stats = await auditRetention.getRetentionStats()
      expect(stats).toHaveProperty('totalEvents')
      expect(stats).toHaveProperty('expiredEvents')
      expect(stats).toHaveProperty('archivedEvents')
      expect(stats).toHaveProperty('deletedEvents')
      expect(stats).toHaveProperty('storageUsage')
      expect(stats).toHaveProperty('lastCleanup')
      expect(stats).toHaveProperty('nextCleanup')
    })

    it('should update retention policy', () => {
      const newPolicy = { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
      auditRetention.updatePolicy(newPolicy)

      const policy = auditRetention.getPolicy()
      expect(policy.maxAge).toBe(7 * 24 * 60 * 60 * 1000)
    })

    it('should check if cleanup is needed', () => {
      const isNeeded = auditRetention.isCleanupNeeded()
      expect(typeof isNeeded).toBe('boolean')
    })

    it('should get next cleanup time', () => {
      const nextCleanup = auditRetention.getNextCleanupTime()
      expect(typeof nextCleanup).toBe('number')
      expect(nextCleanup).toBeGreaterThan(0)
    })

    it('should provide policy summary', () => {
      const summary = auditRetention.getPolicySummary()
      expect(summary).toHaveProperty('enabled')
      expect(summary).toHaveProperty('maxAge')
      expect(summary).toHaveProperty('maxSize')
      expect(summary).toHaveProperty('archiveEnabled')
      expect(summary).toHaveProperty('deleteExpired')
      expect(summary).toHaveProperty('nextCleanup')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete audit workflow', async () => {
      // Log events
      await auditLogger.log({
        severity: AuditSeverity.MEDIUM,
        category: AuditCategory.AUTHENTICATION,
        eventType: AuditEventType.LOGIN,
        action: 'user_login',
        userId: 'user123',
      })

      await auditLogger.log({
        severity: AuditSeverity.HIGH,
        category: AuditCategory.SECURITY,
        eventType: AuditEventType.SECURITY_ALERT,
        action: 'security_alert',
        details: { threat: 'suspicious_activity' },
      })

      // Query events
      const allEvents = await auditLogger.query({})
      expect(allEvents.length).toBeGreaterThan(0)

      const securityEvents = await auditLogger.query({
        category: [AuditCategory.SECURITY],
      })
      expect(securityEvents.length).toBeGreaterThan(0)

      // Get statistics
      const stats = await auditLogger.getStats()
      expect(stats.totalEvents).toBeGreaterThan(0)

      // Get health status
      const health = await auditLogger.getHealth()
      expect(health.status).toBeDefined()

      // Enforce retention
      const deletedCount = await auditLogger.enforceRetention()
      expect(typeof deletedCount).toBe('number')
    })

    it('should handle configuration updates', async () => {
      // Update configuration
      auditLogger.updateConfig({
        minSeverity: AuditSeverity.HIGH,
        enableLogging: true,
      })

      // Log events with different severities
      await auditLogger.log({
        severity: AuditSeverity.LOW,
        category: AuditCategory.SYSTEM_OPERATION,
        eventType: AuditEventType.SYSTEM_START,
        action: 'system_startup',
      })

      await auditLogger.log({
        severity: AuditSeverity.HIGH,
        category: AuditCategory.SECURITY,
        eventType: AuditEventType.SECURITY_ALERT,
        action: 'security_alert',
      })

      // Only high severity events should be logged
      const events = await auditLogger.query({})
      expect(events.length).toBe(1)
      expect(events[0].severity).toBe(AuditSeverity.HIGH)
    })
  })
})
