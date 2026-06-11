## ADDED Requirements

### Requirement: Logged-in homepage shows AI chat immediately

When an authenticated user navigates to `/`, the system SHALL display the full AI chat workspace (`ChatWorkspace`) as the main content, without requiring navigation to a separate route.

#### Scenario: User lands on home after login

- **WHEN** a user successfully logs in
- **THEN** they are directed to `/` and the AI chat dialog (sessions, messages, composer) is immediately visible

#### Scenario: Logged-in user opens root URL

- **WHEN** an authenticated user navigates to `/`
- **THEN** the chat workspace is displayed in the main content area

### Requirement: Guest homepage remains marketing content

When an unauthenticated user navigates to `/`, the system SHALL display the marketing-style homepage with registration and login prompts, not the functional chat workspace.

#### Scenario: Guest views home

- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the marketing homepage is shown and the full chat composer is not available

### Requirement: Sidebar excludes AI Q&A navigation

For authenticated users using the app shell, the left sidebar SHALL NOT include an 「AI 问答」 or equivalent navigation item linking to a separate AI page.

#### Scenario: Sidebar nav items

- **WHEN** a logged-in user views the sidebar
- **THEN** navigation items include 化学知识, 设置, and 关于 only (no AI 问答 entry)

#### Scenario: Return to chat via logo

- **WHEN** a logged-in user clicks the sidebar logo
- **THEN** the browser navigates to `/` where the AI chat workspace is shown

### Requirement: Legacy AI routes redirect to home

The routes `/ai` and `/chat` SHALL redirect to `/` while preserving `location.state` (including `knowledgeAsk`).

#### Scenario: Knowledge ask redirect

- **WHEN** a user triggers 「学习讲解」 or 「出题练习」 from a knowledge detail page
- **THEN** they arrive at `/` with the knowledge ask flow executed

#### Scenario: Old AI URL

- **WHEN** a user navigates to `/ai` or `/chat`
- **THEN** they are redirected to `/` without losing navigation state

### Requirement: Preserved chat and sidebar behaviors

The change SHALL preserve all existing chat functionality (sessions, streaming, knowledge context, role modes) and sidebar navigation to chemistry, settings, and about pages.

#### Scenario: Navigate away and back

- **WHEN** a logged-in user navigates to `/chemistry` via the sidebar and then clicks the logo
- **THEN** they return to `/` with the chat workspace available
