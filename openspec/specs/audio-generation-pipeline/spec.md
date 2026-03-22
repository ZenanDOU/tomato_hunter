## ADDED Requirements

### Requirement: MML dialect specification document
The system SHALL include a machine-readable MML dialect specification that defines all valid tokens, syntax rules, and constraints. This document SHALL serve as the single source of truth for both the parser implementation and Claude prompt templates.

#### Scenario: Spec document covers all tokens
- **WHEN** the MML spec document is read
- **THEN** it defines: notes (c-b), sharps/flats (+/-), octave (o3-o6), lengths (1,2,4,8,16), dotted (.), rest (r), volume (v0-v15), tempo (t60-t200), loops ([...]N), ties (&), and channel identifiers (CH1-CH4)

### Requirement: Claude prompt template for BGM generation
The system SHALL provide a prompt template that instructs Claude to generate MML tracks conforming to the custom dialect. The template SHALL include: the MML dialect spec, the target habitat's audio profile constraints, a few-shot example of a valid MML track, and output format instructions.

#### Scenario: Generate habitat BGM via prompt
- **WHEN** the prompt template is filled with the gear-workshop habitat profile
- **THEN** the resulting prompt instructs Claude to produce a 4-channel MML track in minor key, 130-150 BPM, pulse-wave dominant, with 金属节奏loop characteristic

#### Scenario: Few-shot example included
- **WHEN** the prompt template is rendered
- **THEN** it contains at least one complete, valid MML track example demonstrating correct syntax

### Requirement: Claude prompt template for SFX generation
The system SHALL provide a prompt template that instructs Claude to generate SFX parameter JSON conforming to the preset schema. The template SHALL include: the JSON schema, the target event category, the current habitat profile (if hunt category), and a few-shot example.

#### Scenario: Generate hunt SFX via prompt
- **WHEN** the prompt template is filled for hunt category + withered-gallery habitat
- **THEN** the resulting prompt instructs Claude to produce SFX presets with triangle-wave dominant, high reverb, matching the gallery's ethereal mood

### Requirement: Generated output validation
The system SHALL validate Claude-generated MML and SFX JSON before accepting them. MML output SHALL be parsed by the MML parser with zero errors. SFX JSON SHALL conform to the preset schema.

#### Scenario: Valid MML accepted
- **WHEN** Claude generates an MML track that parses without errors
- **THEN** the track is accepted and saved to the tracks directory

#### Scenario: Invalid MML rejected with feedback
- **WHEN** Claude generates an MML track with syntax errors
- **THEN** the validator returns specific error messages (line, token, expected) suitable for re-prompting Claude

### Requirement: Generation workflow script
The system SHALL provide a CLI-invocable workflow (npm script or standalone) that: reads the habitat profile, renders the prompt template, and outputs the result to the correct file path. The actual Claude API call is the user's responsibility (copy-paste or API integration).

#### Scenario: Render BGM prompt for habitat
- **WHEN** user runs the generation script with --type bgm --habitat gear-workshop
- **THEN** the fully rendered prompt is printed to stdout, ready for Claude input
