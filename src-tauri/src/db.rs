use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create initial tables and seed data",
            sql: include_str!("../migrations/001_initial.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add rescued tomato material",
            sql: include_str!("../migrations/002_rescued_tomato.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add body_part column to tasks",
            sql: include_str!("../migrations/003_body_part.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add strategy_note to pomodoros",
            sql: include_str!("../migrations/004_strategy_note.sql"),
            kind: MigrationKind::Up,
        },
    ]
}
