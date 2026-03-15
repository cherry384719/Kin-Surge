export type QuestionType = 'multiple-choice' | 'fill-blank' | 'ordering'

export interface PoemLine {
  id: number
  poem_id: number
  line_number: number
  text: string
}

export interface PoemInfo {
  id: number
  title: string
  curriculum_grade: string
}

export interface ChallengeQuestionBase {
  id: string
  type: QuestionType
  promptLabel: string
  poemId: number
}

export interface MultipleChoiceQuestion extends ChallengeQuestionBase {
  type: 'multiple-choice'
  prompt: string
  options: string[]
  correctAnswer: string
}

export interface FillBlankQuestion extends ChallengeQuestionBase {
  type: 'fill-blank'
  prompt: string
  answer: string
}

export interface OrderingQuestion extends ChallengeQuestionBase {
  type: 'ordering'
  shuffledLines: string[]
  correctOrder: string[]
}

export type ChallengeQuestion = MultipleChoiceQuestion | FillBlankQuestion | OrderingQuestion
