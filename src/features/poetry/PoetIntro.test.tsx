import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PoetIntro } from './PoetIntro'

test('displays poet name and intro text', () => {
  render(
    <PoetIntro
      poetName="李白"
      intro="吾乃诗仙李白，你可知我那首《静夜思》？来，接我一招！"
      dynastyName="唐朝"
      onStart={vi.fn()}
    />
  )
  expect(screen.getByText('李白')).toBeInTheDocument()
  expect(screen.getByText(/诗仙李白/)).toBeInTheDocument()
})

test('calls onStart when button clicked', async () => {
  const onStart = vi.fn()
  render(
    <PoetIntro poetName="李白" intro="接我一招！" dynastyName="唐朝" onStart={onStart} />
  )
  await userEvent.click(screen.getByRole('button', { name: '开始挑战' }))
  expect(onStart).toHaveBeenCalled()
})

test('shows default intro when intro prop is empty', () => {
  render(<PoetIntro poetName="杜甫" intro="" dynastyName="唐朝" onStart={vi.fn()} />)
  expect(screen.getByText(/杜甫向你发起挑战/)).toBeInTheDocument()
})
