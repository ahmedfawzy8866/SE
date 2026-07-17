/**
 * ECC Memory Engine - Exports
 * 
 * Central nervous system for Sierra Estates agents.
 * Provides MemoryEngine (in-memory pub/sub) and SharedMemoryBus (persistent, file-backed).
 */

export { MemoryEngine, memoryEngine } from './memory-engine'
export type { MemoryEngineConfig } from './memory-engine'
export { SharedMemoryBus, getSharedMemory, sharedMemory } from './shared-memory-bus'
export type { AgentName, MemoryWriteOptions, SharedMemoryEntry, MemoryEvent, MemoryEventType, MemorySubscriber } from './shared-memory-bus'
export type { Agent, Skill, Context, ExecutionLog, Pattern } from './types'
