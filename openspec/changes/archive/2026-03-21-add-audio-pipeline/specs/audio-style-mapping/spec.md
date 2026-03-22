## ADDED Requirements

### Requirement: Habitat audio profile data structure
The system SHALL maintain a configuration object mapping each of the 5 habitats to an audio profile containing: mood keywords (string[]), scale (mode name), bpmRange ([min, max]), dominantWaveform (square|triangle|pulse|noise), reverbLevel (0-1), and signature pattern description (string).

#### Scenario: All 5 habitats have profiles
- **WHEN** the audio system initializes
- **THEN** profiles exist for: gear-workshop (齿轮工坊废墟), withered-gallery (枯竭画廊), forgotten-library (遗忘图书馆), abandoned-garden (荒废花园), mist-swamp (迷雾沼泽)

#### Scenario: Gear Workshop profile values
- **WHEN** the gear-workshop profile is read
- **THEN** it returns: mood ["机械","紧迫"], scale "minor", bpmRange [130,150], dominantWaveform "pulse", reverbLevel 0.2, signature "金属节奏loop"

### Requirement: Profile drives BGM parameters
The system SHALL use the habitat audio profile to configure the BGM player when entering a habitat. The profile's bpmRange, reverbLevel, and dominantWaveform SHALL constrain the corresponding MML track's playback parameters.

#### Scenario: Entering Withered Gallery sets reverb
- **WHEN** the player enters 枯竭画廊
- **THEN** BGM reverb level is set to the profile's reverbLevel (0.8) and the habitat track plays

### Requirement: Profile drives SFX variation
The system SHALL vary hunt SFX parameters based on the current habitat's audio profile. The dominantWaveform and reverbLevel from the profile SHALL influence SFX rendering.

#### Scenario: Hunt SFX in Mist Swamp uses noise
- **WHEN** an attack-hit SFX plays in 迷雾沼泽
- **THEN** the SFX uses noise-influenced timbre and high reverb (0.9) from the swamp profile

### Requirement: Profile exportable for Claude prompt
The system SHALL export the habitat profiles in a structured text format suitable for inclusion in Claude generation prompts. The export SHALL include all constraint fields with their values.

#### Scenario: Export profiles for prompt template
- **WHEN** the audio pipeline tooling requests profile export
- **THEN** a structured text block is produced listing each habitat's mood, scale, bpmRange, dominantWaveform, reverbLevel, and signature
