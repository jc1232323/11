## ADDED Requirements

### Requirement: Multi-section homepage layout

The homepage at `/` SHALL display multiple content sections beyond a single hero, including module overview, featured knowledge links, and AI capability introduction, so the page does not appear sparse or empty.

#### Scenario: Visitor sees rich homepage

- **WHEN** a user navigates to `/`
- **THEN** the page shows at least four distinct sections (hero, knowledge overview, featured topics, and AI highlights)

### Requirement: Knowledge overview from live data

The homepage SHALL fetch and display knowledge module summaries from the knowledge tree API, showing real module names and links to the chemistry catalog.

#### Scenario: Module cards rendered

- **WHEN** the knowledge tree API returns modules
- **THEN** the homepage displays module overview cards with titles and links to `/chemistry`

### Requirement: Featured knowledge links

The homepage SHALL display a list of featured knowledge topic links (at least 6) drawn from the published knowledge catalog.

#### Scenario: Topic links clickable

- **WHEN** a user clicks a featured topic link on the homepage
- **THEN** the browser navigates to the corresponding `/chemistry/:slug` detail page

### Requirement: Homepage calls-to-action

The homepage SHALL provide prominent calls-to-action for both learning knowledge and using AI Q&A, with CTA targets adapting to authentication state.

#### Scenario: Logged-in CTAs

- **WHEN** a logged-in user views the homepage hero
- **THEN** primary CTA links to `/ai` and secondary CTA links to `/chemistry`

#### Scenario: Guest CTAs

- **WHEN** an unauthenticated user views the homepage hero
- **THEN** primary CTA prompts registration or login and secondary CTA links to browse chemistry catalog if publicly accessible

### Requirement: Homepage is not the chat workspace

The homepage SHALL NOT embed the full AI chat composer and message thread; AI interaction remains on the dedicated `/ai` page.

#### Scenario: No chat UI on home

- **WHEN** a logged-in user views `/`
- **THEN** the full chat session UI is not displayed on the homepage
