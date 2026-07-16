import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

type GatewayRuntime = Readonly<{
  validateSubmission_: (payload: unknown) => { submissionId: string; identity: { displayName: string } }
  findDuplicate_: (sheet: unknown, submissionId: string, payloadHash: string) => 'none' | 'same' | 'conflict'
  rebuildIdentitySummary_: (resultsSheet: unknown, summarySheet: unknown, identityKey: string) => void
  RESULTS_HEADERS: readonly string[]
  SUMMARY_HEADERS: readonly string[]
}>

function loadGateway(): GatewayRuntime {
  const source = readFileSync(resolve(process.cwd(), 'backend/apps-script/Code.gs'), 'utf8')
  const context = vm.createContext({})
  vm.runInContext(source, context)
  return context as unknown as GatewayRuntime
}

function validPayload() {
  return {
    action: 'submitResult',
    schemaVersion: 1,
    submissionId: 'mel-test-12345',
    result: {
      timestamp: '2026-07-15T20:00:00.000Z',
      game: 'Macromolecule Evidence Lab',
      gameVersion: 'evidence-lab-v1',
      contentVersion: 'unit2-slides-11-16-v1',
      studentName: 'Maya j.',
      startedAt: '2026-07-15T19:50:00.000Z',
      completedAt: '2026-07-15T20:00:00.000Z',
      activeSeconds: 600,
      diagnostic: { correct: 12, total: 16 },
      transfer: { correct: 6, total: 8 },
      byMacromolecule: {
        Carbohydrate: { correct: 4, total: 4 },
        Lipid: { correct: 2, total: 4 },
        Protein: { correct: 4, total: 4 },
        'Nucleic Acid': { correct: 2, total: 4 },
      },
      byConcept: {
        elements: { correct: 2, total: 2 },
        'building-block': { correct: 1, total: 2 },
        function: { correct: 1, total: 2 },
        example: { correct: 2, total: 2 },
      },
      repairsCompleted: 2,
      unresolvedCount: 0,
      misconceptionCodes: ['lipid-function', 'protein-example'],
    },
  }
}

describe('Apps Script result contract', () => {
  it('normalizes identity and accepts the 16-check/8-check relationship', () => {
    const validated = loadGateway().validateSubmission_(validPayload())
    expect(validated.submissionId).toBe('mel-test-12345')
    expect(validated.identity.displayName).toBe('Maya J')
  })

  it('rejects malformed totals, conflicting metric sums, and repeated misconception codes', () => {
    const runtime = loadGateway()
    const malformed = validPayload()
    malformed.result.diagnostic.total = 8
    expect(() => runtime.validateSubmission_(malformed)).toThrow(/Diagnostic total/)

    const conflicting = validPayload()
    conflicting.result.byMacromolecule.Lipid.correct = 1
    expect(() => runtime.validateSubmission_(conflicting)).toThrow(/correct counts/)

    const repeated = validPayload()
    repeated.result.misconceptionCodes = ['same-code', 'same-code']
    expect(() => runtime.validateSubmission_(repeated)).toThrow(/distinct/)

    const stale = validPayload()
    stale.result.contentVersion = 'older-content-v0'
    expect(() => runtime.validateSubmission_(stale)).toThrow(/content version/)

    const impossibleConcepts = validPayload()
    impossibleConcepts.result.diagnostic.correct = 4
    impossibleConcepts.result.byMacromolecule = {
      Carbohydrate: { correct: 1, total: 4 },
      Lipid: { correct: 1, total: 4 },
      Protein: { correct: 1, total: 4 },
      'Nucleic Acid': { correct: 1, total: 4 },
    }
    impossibleConcepts.result.byConcept = {
      elements: { correct: 2, total: 2 },
      'building-block': { correct: 2, total: 2 },
      function: { correct: 2, total: 2 },
      example: { correct: 2, total: 2 },
    }
    expect(() => runtime.validateSubmission_(impossibleConcepts)).toThrow(/Evidence-concept counts/)

    const impossibleTiming = validPayload()
    impossibleTiming.result.activeSeconds = 700
    expect(() => runtime.validateSubmission_(impossibleTiming)).toThrow(/Active seconds/)
  })

  it('distinguishes exact duplicate IDs from conflicting payload hashes', () => {
    const runtime = loadGateway()
    const fakeSheet = {
      getLastRow: () => 2,
      getRange: (...args: number[]) => {
        if (args.length === 4) {
          return {
            createTextFinder: () => ({
              matchEntireCell: () => ({ findAll: () => [{ getRow: () => 2 }] }),
            }),
          }
        }
        return { getValue: () => 'stored-hash' }
      },
    }
    expect(runtime.findDuplicate_(fakeSheet, 'mel-test-12345', 'stored-hash')).toBe('same')
    expect(runtime.findDuplicate_(fakeSheet, 'mel-test-12345', 'changed-hash')).toBe('conflict')
  })

  it('recomputes one summary row using latest, best, source, and collision fields', () => {
    const runtime = loadGateway()
    const row = (values: Record<string, unknown>) => runtime.RESULTS_HEADERS.map((header) => values[header] ?? '')
    const results = [
      [...runtime.RESULTS_HEADERS],
      row({
        'Submission ID': 'mel-attempt-one', 'Identity Key': 'maya|j', 'First Name': 'Maya', 'Last Initial': 'J',
        'Completed At': '2026-07-15T20:00:00.000Z', 'Diagnostic Correct': 12, 'Diagnostic Total': 16,
        'Diagnostic Percent': 75, 'Transfer Correct': 6, 'Transfer Total': 8, 'Transfer Percent': 75,
        'Weakest Macromolecule': 'Lipid', 'Weakest Concept': 'function', 'Repairs Completed': 2, 'Unresolved Count': 0,
      }),
      row({
        'Submission ID': 'mel-attempt-two', 'Identity Key': 'maya|j', 'First Name': 'Maya', 'Last Initial': 'J',
        'Completed At': '2026-07-15T21:00:00.000Z', 'Diagnostic Correct': 10, 'Diagnostic Total': 16,
        'Diagnostic Percent': 62.5, 'Transfer Correct': 8, 'Transfer Total': 8, 'Transfer Percent': 100,
        'Weakest Macromolecule': 'Protein', 'Weakest Concept': 'example', 'Repairs Completed': 3, 'Unresolved Count': 0,
      }),
    ]
    let written: unknown[][] = []
    const summarySheet = {
      getDataRange: () => ({ getValues: () => [[...runtime.SUMMARY_HEADERS]] }),
      getLastRow: () => 1,
      getRange: () => ({ setValues: (values: unknown[][]) => { written = values } }),
    }
    runtime.rebuildIdentitySummary_({ getDataRange: () => ({ getValues: () => results }) }, summarySheet, 'maya|j')

    const saved = Object.fromEntries(runtime.SUMMARY_HEADERS.map((header, index) => [header, written[0][index]]))
    expect(saved['Attempt Count']).toBe(2)
    expect(saved['Latest Submission ID']).toBe('mel-attempt-two')
    expect(saved['Best Diagnostic Correct']).toBe(12)
    expect(saved['Latest Transfer Correct']).toBe(8)
    expect(saved['Source Submission IDs']).toBe('mel-attempt-one | mel-attempt-two')
    expect(saved['Possible Name Collision Review']).toBe('REVIEW')
  })
})
