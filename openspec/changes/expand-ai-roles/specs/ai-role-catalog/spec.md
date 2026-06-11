## ADDED Requirements

### Requirement: Expanded AI role catalog

The system SHALL provide at least ten distinct AI tutor roles for high-school chemistry tutoring, each with a unique identifier, display name, short description, and system prompt.

#### Scenario: Role list available

- **WHEN** a logged-in user opens the chat role selector
- **THEN** at least ten roles are selectable, including the existing 思路直达 and 温柔老师 roles

#### Scenario: New gaokao sprint role

- **WHEN** a user selects the 高考冲刺 role
- **THEN** the AI responses emphasize exam-focused tips, common traps, and high-frequency test points

### Requirement: Role-specific system prompts

Each role SHALL have a dedicated system prompt that produces noticeably different tutoring behavior aligned with the role's description.

#### Scenario: Foundation role behavior

- **WHEN** a user selects the 基础入门 role and asks about a concept
- **THEN** the AI uses simple language and analogies before introducing formulas

#### Scenario: Experiment role behavior

- **WHEN** a user selects the 实验达人 role and asks about an experiment question
- **THEN** the AI addresses apparatus, variables, observations, and error analysis

### Requirement: Default role in settings

The settings page SHALL allow users to set any catalog role as their default AI role for new sessions.

#### Scenario: Save default role

- **WHEN** a user selects 高考冲刺 as default role in settings and saves
- **THEN** newly created chat sessions use the gaokao-sprint role unless overridden

### Requirement: Grouped role selector UI

The chat workspace role selector SHALL display roles in logical groups with visible labels and brief descriptions.

#### Scenario: Grouped options

- **WHEN** a user opens the role dropdown in chat
- **THEN** roles are organized into groups (e.g. daily study, exam prep, specialized) with human-readable names

### Requirement: Backward compatibility

Existing sessions with roleMode `direct` or `guide` SHALL continue to function without migration.

#### Scenario: Legacy session

- **WHEN** a user opens an older chat session with roleMode `guide`
- **THEN** messages stream using the 温柔老师 prompt as before
