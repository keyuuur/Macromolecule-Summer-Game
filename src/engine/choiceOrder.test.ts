import { describe, expect, it } from 'vitest'
import { seededChoiceOrder } from './choiceOrder'

describe('seeded choice order', () => {
  const choices = ['a', 'b', 'c', 'd', 'e', 'f']

  it('recreates the same option order after a refresh', () => {
    expect(seededChoiceOrder(choices, 42, 'case:macro')).toEqual(seededChoiceOrder(choices, 42, 'case:macro'))
  })

  it('uses both the seed and case salt without losing options', () => {
    const first = seededChoiceOrder(choices, 42, 'case:macro')
    const second = seededChoiceOrder(choices, 43, 'case:macro')
    const third = seededChoiceOrder(choices, 42, 'other:evidence')
    expect(first).not.toEqual(second)
    expect(first).not.toEqual(third)
    expect([...first].sort()).toEqual(choices)
  })
})
