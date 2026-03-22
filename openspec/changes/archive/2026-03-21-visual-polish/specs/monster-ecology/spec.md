## MODIFIED Requirements

### Requirement: Monster family ecosystem
The system SHALL organize all monster species into 5 families, each corresponding to a task category, with a shared habitat and evolutionary progression from juvenile to adult to king tier. Family names SHALL reflect the actual creature types in each habitat.

#### Scenario: Family data available
- **WHEN** the bestiary is loaded
- **THEN** each species belongs to exactly one family: 锈蚀机械兽 (work), 枯彩幻灵 (creative), 蛀典书灵 (study), 荒野蔓生兽 (life), 迷雾幻形体 (other)

#### Scenario: Evolution chain coherence
- **WHEN** a user encounters species from the same family at different difficulties
- **THEN** the species share visual traits and family name, making the evolutionary relationship apparent

## ADDED Requirements

### Requirement: Visually distinct apex creatures
The system SHALL ensure all 5 apex creatures have completely different silhouettes for instant recognition at 32x32 pixel resolution: 锻炉蟒 (snake), 画境凤 (phoenix), 封典巨鸮 (owl), 古树熊 (bear), 深渊水母 (jellyfish).

#### Scenario: Five apex silhouettes are distinct
- **WHEN** any two apex creature sprites are compared
- **THEN** their silhouettes are clearly different body forms (no two share the same general shape)

### Requirement: Creative apex replacement - 画境凤
The system SHALL replace 画境龙 with 画境凤 as the creative apex creature, with traits 🔥焚稿·推倒重来 and 🌈涅槃·完美主义的无限循环, body parts 凤冠/焰翼/尾羽, and visual description "从废弃画作中燃起的火鸟，身体由褪色颜料和火焰构成".

#### Scenario: Creative legendary monster is phoenix
- **WHEN** a legendary creative task generates a monster
- **THEN** the species is 画境凤 with emoji 🔥 and phoenix-themed traits and body parts

### Requirement: Study apex replacement - 封典巨鸮
The system SHALL replace 知识龙 with 封典巨鸮 as the study apex creature, with traits 🦉凝视·畏难情绪 and 📚封印·知识壁垒, body parts 鸮目/书翼/封爪, and visual description "远古巨型猫头鹰守护者，羽翼由书页和知识符文构成".

#### Scenario: Study legendary monster is owl
- **WHEN** a legendary study task generates a monster
- **THEN** the species is 封典巨鸮 with emoji 🦉 and owl-themed traits and body parts

### Requirement: Other apex replacement - 深渊水母
The system SHALL replace 混沌龙 with 深渊水母 as the other apex creature, with traits 🪼缠绕·完全失控 and 🌀扭曲·认知偏差, body parts 伞盖/核心/触须, and visual description "迷雾深处的半透明巨型水母，身体由漩涡和扭曲的光构成".

#### Scenario: Other legendary monster is jellyfish
- **WHEN** a legendary other task generates a monster
- **THEN** the species is 深渊水母 with emoji 🪼 and jellyfish-themed traits and body parts
