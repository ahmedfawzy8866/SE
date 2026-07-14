/**
 * Tests: SharedMemoryBus
 * 
 * Tests for the shared memory layer that all agents use.
 * Run: jest packages/memory-engine/src/__tests__/shared-memory-bus.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { SharedMemoryBus } from '../shared-memory-bus'

// Use a temp file for each test run so tests are isolated
function makeTempPath(): string {
  return path.join(os.tmpdir(), `sierra-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
}

describe('SharedMemoryBus', () => {
  let bus: SharedMemoryBus
  let storePath: string

  beforeEach(() => {
    storePath = makeTempPath()
    bus = new SharedMemoryBus(storePath)
  })

  afterEach(() => {
    if (fs.existsSync(storePath)) {
      fs.unlinkSync(storePath)
    }
  })

  // ── Basic Write/Read ────────────────────────────────────────────────────────

  describe('write() and read()', () => {
    it('should write and read a value correctly', async () => {
      await bus.write('test-key', { hello: 'world' }, { author: 'sierra' })
      const result = await bus.read('test-key')
      expect(result).toEqual({ hello: 'world' })
    })

    it('should return null for non-existent key', async () => {
      const result = await bus.read('does-not-exist')
      expect(result).toBeNull()
    })

    it('should overwrite existing entries', async () => {
      await bus.write('key', 'first', { author: 'liela' })
      await bus.write('key', 'second', { author: 'sierra' })
      const result = await bus.read('key')
      expect(result).toBe('second')
    })
  })

  // ── Search ──────────────────────────────────────────────────────────────────

  describe('search()', () => {
    it('should find entries by tag', async () => {
      await bus.write('prop-001', { code: 'SE001' }, { author: 'openclaw', tags: ['property-data'] })
      await bus.write('prop-002', { code: 'SE002' }, { author: 'openclaw', tags: ['property-data'] })
      await bus.write('lead-001', { phone: '+201234567890' }, { author: 'liela', tags: ['lead-profile'] })

      const props = await bus.search('', ['property-data'])
      expect(props.length).toBe(2)

      const leads = await bus.search('', ['lead-profile'])
      expect(leads.length).toBe(1)
    })

    it('should filter by agent', async () => {
      await bus.write('from-liela', 'msg', { author: 'liela' })
      await bus.write('from-sierra', 'analysis', { author: 'sierra' })

      const lielasEntries = await bus.byAgent('liela')
      expect(lielasEntries.length).toBeGreaterThanOrEqual(1)
      // All returned entries should have 'liela' tag
      lielasEntries.forEach((e) => {
        expect(e.tags).toContain('liela')
      })
    })
  })

  // ── Lead Profile ────────────────────────────────────────────────────────────

  describe('Lead Profile CRUD', () => {
    it('should save and retrieve a lead profile', async () => {
      const phone = '+201012345678'
      const profile = {
        name: 'Ahmed',
        preferences: { type: 'apartment', bedrooms: 2 },
      }
      await bus.saveLeadProfile(phone, profile, 'liela')
      const retrieved = await bus.getLeadProfile(phone)
      expect(retrieved).toMatchObject(profile)
    })

    it('should return null for unknown client', async () => {
      const result = await bus.getLeadProfile('+9999999999')
      expect(result).toBeNull()
    })
  })

  // ── Conversation History ────────────────────────────────────────────────────

  describe('Conversation History', () => {
    it('should record and retrieve conversation turns', async () => {
      const phone = '+201099887766'
      await bus.recordConversationTurn(phone, 'liela', 'outbound', 'اهلا، كيف يمكنني مساعدتك؟')
      await bus.recordConversationTurn(phone, 'system', 'inbound', 'عايز شقة في التجمع')
      await bus.recordConversationTurn(phone, 'sierra', 'outbound', 'وجدت 3 شقق مناسبة')

      const history = await bus.getClientHistory(phone)
      expect(history.length).toBe(3)
    })

    it('should not mix up conversations between clients', async () => {
      await bus.recordConversationTurn('+201111111111', 'liela', 'outbound', 'Hello client A')
      await bus.recordConversationTurn('+202222222222', 'liela', 'outbound', 'Hello client B')

      const historyA = await bus.getClientHistory('+201111111111')
      const historyB = await bus.getClientHistory('+202222222222')

      expect(historyA.length).toBe(1)
      expect(historyB.length).toBe(1)
    })
  })

  // ── TTL / Expiry ────────────────────────────────────────────────────────────

  describe('TTL Expiry', () => {
    it('should expire entries after TTL', async () => {
      await bus.write('temp-key', 'temporary', {
        author: 'system',
        ttl: 50, // 50ms
      })

      // Should exist immediately
      const before = await bus.read('temp-key')
      expect(before).toBe('temporary')

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 150))

      const after = await bus.read('temp-key')
      expect(after).toBeNull()
    }, 10_000)
  })

  // ── Pub/Sub ──────────────────────────────────────────────────────────────────

  describe('Pub/Sub', () => {
    it('should notify subscribers on write', async () => {
      const events: unknown[] = []
      bus.on('write', (e) => events.push(e))

      await bus.write('notify-test', 'data', { author: 'hermes' })

      expect(events.length).toBe(1)
      expect((events[0] as { type: string }).type).toBe('write')
    })

    it('should allow unsubscribe', async () => {
      const events: unknown[] = []
      const unsub = bus.on('write', (e) => events.push(e))

      await bus.write('key1', 'data', { author: 'liela' })
      unsub()
      await bus.write('key2', 'data', { author: 'liela' })

      expect(events.length).toBe(1) // only first write
    })
  })

  // ── Stats ────────────────────────────────────────────────────────────────────

  describe('stats()', () => {
    it('should return correct totals and per-agent breakdown', async () => {
      await bus.write('s1', 'a', { author: 'sierra' })
      await bus.write('s2', 'b', { author: 'sierra' })
      await bus.write('l1', 'c', { author: 'liela' })

      const stats = await bus.stats()
      expect(stats.total).toBeGreaterThanOrEqual(3)
      expect(stats.byAgent['sierra']).toBeGreaterThanOrEqual(2)
      expect(stats.byAgent['liela']).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Delete ───────────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('should delete an entry', async () => {
      await bus.write('del-me', 'value', { author: 'system' })
      await bus.delete('del-me')
      const result = await bus.read('del-me')
      expect(result).toBeNull()
    })
  })
})
