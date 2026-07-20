import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StartScreen } from './StartScreen'

describe('StartScreen pending-result privacy controls', () => {
  it('shows the unsent-result warning and invokes the delete action', () => {
    const onClearPending = vi.fn()
    render(
      <StartScreen
        onStart={vi.fn()}
        pendingCount={2}
        onClearPending={onClearPending}
      />,
    )

    expect(screen.getByText('2 unsent results are saved on this iPad.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Delete unsent results from this iPad' }))
    expect(onClearPending).toHaveBeenCalledOnce()
  })
})
