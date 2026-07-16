import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { CASE_BANK, TUTORIAL_CASE } from '../../src/content/cases'
import type { DiagnosticCase } from '../../src/types'
import { MACROMOLECULES } from '../../src/types'

async function startLab(page: Page) {
  await page.goto('/')
  await page.getByLabel('First name').fill('Maya')
  await page.getByLabel('Last initial').fill('J')
  await page.getByRole('button', { name: /Begin practice case/ }).click()
}

async function currentCase(page: Page): Promise<DiagnosticCase> {
  const prompt = await page.getByTestId('case-clue').innerText()
  const evidenceQuestion = await page.getByTestId('evidence-question').innerText()
  const item = [TUTORIAL_CASE, ...CASE_BANK].find((candidate) =>
    prompt.includes(candidate.prompt) && evidenceQuestion.includes(candidate.evidenceQuestion),
  )
  if (!item) throw new Error(`No content case matched prompt: ${prompt}`)
  return item
}

async function assertNoAnswerLeak(page: Page, item: DiagnosticCase) {
  const visibleWithoutChoices = await page.locator('#main-content').evaluate((node) => {
    const copy = node.cloneNode(true) as HTMLElement
    copy.querySelector('[data-testid="macro-choices"]')?.remove()
    copy.querySelector('[data-testid="evidence-choices"]')?.remove()
    return copy.innerText
  })
  const hiddenText = visibleWithoutChoices.toLocaleLowerCase()
  expect(hiddenText).not.toContain(item.correctMacro.toLocaleLowerCase())
  expect(hiddenText).not.toContain(item.correctEvidence.toLocaleLowerCase())
}

async function answerCase(page: Page, verifyLeak = true) {
  const item = await currentCase(page)
  if (verifyLeak) await assertNoAnswerLeak(page, item)
  await page.getByRole('radio', { name: item.correctMacro, exact: true }).check()
  await page.getByRole('radio', { name: item.correctEvidence, exact: true }).check()
  await page.getByRole('button', { name: /Record both answers/ }).click()
  return item
}

async function finishTutorial(page: Page) {
  await answerCase(page, false)
  await expect(page.getByRole('heading', { name: 'Your claim matches the evidence.' })).toBeVisible()
  await page.getByRole('button', { name: /Begin evidence cases/ }).click()
}

async function finishAllCorrect(page: Page) {
  for (let index = 0; index < 8; index += 1) await answerCase(page)
  await expect(page.getByText('Use what you repaired. Reference cards are now closed.')).toBeVisible()
  for (let index = 0; index < 4; index += 1) await answerCase(page)
}

test('all-correct flow hides answers and ends with a non-graded local summary', async ({ page }) => {
  await startLab(page)
  await finishTutorial(page)
  await finishAllCorrect(page)

  await expect(page.getByRole('heading', { name: 'Your evidence changed with practice.' })).toBeVisible()
  await expect(page.getByText('This is a learning summary, not a grade.')).toBeVisible()
  await expect(page.getByText('100%')).toHaveCount(2)
  await expect(page.getByText(/not connected to Mr. Patel’s Sheet/)).toBeVisible()

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([])

  await page.getByRole('button', { name: /Start another attempt/ }).click()
  await expect(page.getByRole('heading', { name: 'Set up your lab record' })).toBeVisible()
  await expect(page.getByLabel('First name')).toHaveValue('')
  await expect(page.getByLabel('Last initial')).toHaveValue('')
})

test('a distinct first-try misconception enters focused repair before fresh transfer', async ({ page }) => {
  await startLab(page)
  await finishTutorial(page)

  const missed = await currentCase(page)
  await assertNoAnswerLeak(page, missed)
  const wrongMacro = MACROMOLECULES.find((macro) => macro !== missed.correctMacro)!
  const wrongEvidence = missed.evidenceChoices.find((choice) => choice !== missed.correctEvidence)!
  await page.getByRole('radio', { name: wrongMacro, exact: true }).check()
  await page.getByRole('radio', { name: wrongEvidence, exact: true }).check()
  await page.getByRole('button', { name: /Record both answers/ }).click()

  for (let index = 1; index < 8; index += 1) await answerCase(page)
  await expect(page.getByText('Focused reference', { exact: true })).toBeVisible()
  await expect(page.getByText('This card targets one pattern from your first attempt.')).toBeVisible()
  await page.getByRole('radio', { name: missed.correctMacro, exact: true }).check()
  await page.getByRole('radio', { name: missed.correctEvidence, exact: true }).check()
  await page.getByRole('button', { name: /Check repair/ }).click()

  for (let index = 0; index < 4; index += 1) await answerCase(page)
  await expect(page.getByText('Every queued repair was completed.')).toBeVisible()
})

test('refresh offers privacy-safe resume and preserves active case option order', async ({ page }) => {
  await startLab(page)
  await finishTutorial(page)

  const caseBefore = await currentCase(page)
  const orderBefore = await page.getByTestId('macro-choices').locator('label').allTextContents()
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Continue your evidence lab?' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('Maya J')
  await page.getByRole('button', { name: /Continue lab/ }).click()
  expect((await currentCase(page)).id).toBe(caseBefore.id)
  expect(await page.getByTestId('macro-choices').locator('label').allTextContents()).toEqual(orderBefore)
})

test('cached app can finish while offline and labels the result as iPad-only', async ({ page, context }) => {
  await startLab(page)
  await finishTutorial(page)
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready
  })
  await page.reload()
  await page.getByRole('button', { name: /Continue lab/ }).click()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Continue your evidence lab?' })).toBeVisible()
  await page.getByRole('button', { name: /Continue lab/ }).click()
  await finishAllCorrect(page)
  await expect(page.getByText(/Saved on this iPad/)).toBeVisible()
  await expect(page.getByText(/not connected to Mr. Patel’s Sheet/)).toBeVisible()
  await context.setOffline(false)
})

test('name entry and diagnostic controls work with the keyboard', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('First name').focus()
  await page.keyboard.type('Maya')
  await page.keyboard.press('Tab')
  await page.keyboard.type('J')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Practice the evidence routine' })).toBeVisible()

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([])
})

test('storage failure stays visible after the student begins', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('storage blocked') }
  })
  await startLab(page)
  await expect(page.getByRole('alert')).toContainText('could not save progress')
  await expect(page.getByRole('heading', { name: 'Practice the evidence routine' })).toBeVisible()
})
