## ADDED Requirements

### Requirement: Dedicated AI chat route

The system SHALL provide a dedicated AI Q&A page at `/ai` for authenticated users, separate from the homepage and chemistry pages.

#### Scenario: Access AI page when logged in

- **WHEN** a logged-in user navigates to `/ai`
- **THEN** the full chat workspace (sessions, messages, role selector, composer) is displayed

#### Scenario: Guest redirected from AI page

- **WHEN** an unauthenticated user navigates to `/ai`
- **THEN** the user is redirected to login or shown a login prompt before accessing chat

### Requirement: Immersive AI visual design

The `/ai` page SHALL use a distinct blue-themed visual treatment (gradient or tinted background, blue-accented bubbles and controls) that differentiates it from standard content pages.

#### Scenario: Blue-themed chat area

- **WHEN** a logged-in user views `/ai`
- **THEN** the page background and chat UI elements use visibly blue-tinted styling

### Requirement: Sidebar navigation for non-AI features

For authenticated users, the application SHALL use a left sidebar for navigation to 化学知识, 设置, 关于, and AI 问答 (/ai), replacing horizontal top-bar feature navigation.

#### Scenario: Sidebar nav items

- **WHEN** a logged-in user views any app page
- **THEN** a sidebar shows navigation links including AI 问答 pointing to `/ai`

#### Scenario: Active AI nav state

- **WHEN** a logged-in user is on `/ai`
- **THEN** the AI 问答 sidebar item is highlighted as active

### Requirement: Chat route compatibility

The legacy `/chat` route SHALL redirect to `/ai` while preserving `location.state`.

#### Scenario: Old chat URL

- **WHEN** a user navigates to `/chat` with optional state
- **THEN** they are redirected to `/ai` without losing navigation state

### Requirement: Preserved chat behaviors

The dedicated AI page SHALL preserve session management, role mode switching, streaming responses, and error handling.

#### Scenario: Send message on AI page

- **WHEN** a user sends a message on `/ai`
- **THEN** the assistant response streams and persists in the session history
