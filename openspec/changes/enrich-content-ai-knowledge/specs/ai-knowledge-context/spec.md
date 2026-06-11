## ADDED Requirements

### Requirement: Knowledge topic selector in AI chat

The AI chat page SHALL allow users to select or bind a knowledge topic (by slug) as context for the conversation, via a searchable selector showing the knowledge tree.

#### Scenario: Select topic in chat

- **WHEN** a logged-in user opens the knowledge selector on `/ai` and picks a topic
- **THEN** the selected topic title is displayed as the active knowledge context for the session

### Requirement: Explain mode using knowledge content

The system SHALL support an `explain` ask mode that uses the bound knowledge topic's Markdown content to generate a tutoring explanation appropriate for high-school students.

#### Scenario: Explain from knowledge detail page

- **WHEN** a user clicks 「学习讲解」 or equivalent on a knowledge detail page
- **THEN** they are taken to `/ai` with the topic bound and an explanation request initiated or pre-filled

#### Scenario: Explain uses server-side content

- **WHEN** a user sends a message in explain mode with a bound `knowledgeSlug`
- **THEN** the backend loads the topic content from the database and includes it in the LLM prompt

### Requirement: Practice mode generates exercises

The system SHALL support a `practice` ask mode that uses the bound knowledge topic to generate practice questions (with answers and brief explanations) suitable for high-school level.

#### Scenario: Practice from knowledge detail page

- **WHEN** a user clicks 「出题练习」 on a knowledge detail page
- **THEN** they are taken to `/ai` with the topic bound and a practice-question request initiated or pre-filled

#### Scenario: Practice prompt content

- **WHEN** a user triggers practice mode for a bound topic
- **THEN** the AI response includes multiple practice questions related to that topic's content

### Requirement: Knowledge context API fields

The chat message API SHALL accept optional `knowledgeSlug` and `askMode` fields so the server can resolve knowledge content and apply mode-specific prompt instructions.

#### Scenario: API accepts knowledge context

- **WHEN** the client sends a chat message with `knowledgeSlug` and `askMode: "practice"`
- **THEN** the server uses the slug to load knowledge and applies practice-mode prompt instructions

### Requirement: Backward compatible explain from detail page

The existing 「没懂？问 AI 讲解」 flow from knowledge detail pages SHALL continue to work, equivalent to explain mode with the topic pre-bound.

#### Scenario: Legacy ask AI button

- **WHEN** a user clicks 「没懂？问 AI 讲解」 on a topic page
- **THEN** they arrive at `/ai` with explain mode and the correct topic context
