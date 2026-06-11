## ADDED Requirements

### Requirement: Three-level knowledge hierarchy

The knowledge catalog SHALL organize content in three levels: module (L1) → chapter (L2) → topic (L3, Markdown article with unique slug).

#### Scenario: Tree API returns nested structure

- **WHEN** a client requests `GET /knowledge/tree`
- **THEN** the response contains modules, each with nested chapters, each with nested topic entries (id, slug, title)

### Requirement: Expanded knowledge content

The published knowledge catalog SHALL include substantially more content than the current MVP (2 chapters, 8 topics), covering at least four modules with multiple chapters and topics each, for a total of at least 20 published topic articles.

#### Scenario: Module count

- **WHEN** the knowledge tree is loaded after content import
- **THEN** at least four modules are present

#### Scenario: Topic count

- **WHEN** the knowledge tree is loaded after content import
- **THEN** at least twenty topic articles are available

### Requirement: Chemistry browse page shows hierarchy

The `/chemistry` page SHALL display the three-level hierarchy, allowing users to browse by module and chapter before opening a topic.

#### Scenario: Browse modules

- **WHEN** a user opens `/chemistry`
- **THEN** modules are shown with their chapters and topic links grouped underneath

### Requirement: Markdown import supports modules

The content import process SHALL support module → chapter → topic directory structure and frontmatter, importing all three levels into `knowledge_nodes`.

#### Scenario: Import new module

- **WHEN** an operator runs the content import command with new module directories
- **THEN** module, chapter, and topic nodes are created or updated in the database

### Requirement: Existing content migrated

Existing chapter/topic content (物质的量, 离子反应) SHALL be reorganized under an appropriate parent module without breaking existing topic slugs.

#### Scenario: Legacy slug still works

- **WHEN** a user navigates to an existing topic slug such as `/chemistry/mol-concept`
- **THEN** the topic detail page loads correctly after migration
