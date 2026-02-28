# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**通天路 (Tongtian Lu - "The Heavenly Path")** is an interactive Chinese poetry learning platform built by team Kin Surge. Target users are primary and middle school students (ages 6–15), their parents, and teachers. The platform gamifies learning poems from the official national curriculum (部编版语文教材) through historical dynasty exploration and 1v1 challenges with AI-rendered historical poets.

**Status:** Early development — currently in planning phase with no code yet committed.

## Planned Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Native iOS / Android |
| Web | WeChat Mini Program + PC browser |
| 3D Graphics | Unity 3D (historical scene rendering) |
| Backend / NLP | Natural Language Processing for poem input validation |
| Content DB | 3000+ poem database (dynasty, author, meaning, curriculum alignment) |

## Core Architecture

### Three User Roles
- **Student** — primary learner; accesses game modes, earns rewards
- **Parent** — monitoring dashboard, joint-participation features
- **Teacher** — class management, assignment creation, analytics

These form a closed-loop ecosystem: 学生学习 → 家长监督 → 教师指导.

### Five Main Modules

1. **Dynasty Scene System** — 6 historical periods (Han → Wei-Jin → Tang → Song → Yuan → Ming-Qing), 3–5 themed scenes each; scene assets unlock as the player progresses.

2. **Poetry Interaction Engine (Core)** — 1v1 dialogue with 5–8 historical poets per dynasty. Difficulty ladder:
   - Beginner: 2-choice selection
   - Intermediate: 3-choice selection
   - Master: free-text input (requires NLP validation)

3. **Comprehension Dictation Module** — curriculum-synchronised writing practice with error tracking and remediation loops.

4. **Progress & Analytics** — learning reports for students/parents/teachers; error analysis.

5. **Gamification Layer** — coin economy, 6-tier rank system (童生 → 诗仙), leaderboards (class / school / national), achievement badges, 飞花令 relay game mode.

## Development Notes

- No `package.json`, `Makefile`, or build scripts exist yet. Add this section once the tech stack is scaffolded.
- The project plan document lives at `项目策划书.pdf` in the repo root (Chinese, 15 pages).
- All user-facing content and UI copy should be in Simplified Chinese.
- Poetry database must map each poem to its curriculum source (教材同步) for the dictation module to function correctly.
