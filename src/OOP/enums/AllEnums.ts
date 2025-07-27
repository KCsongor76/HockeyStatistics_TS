export enum ActionType {
    SHOT = "Shot",
    GOAL = "Goal",
    ASSIST = "Assist",
    TURNOVER = "Turnover",
}

export enum GameType {
    REGULAR = "Regular",
    PLAYOFF = "Playoff",
}

export enum RegularPeriod {
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
    OT = 4,
    SO = 5
}

export enum PlayoffPeriod {
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
    OT1 = 4,
    OT2 = 5,
    OT3 = 6,
    OT4 = 7,
    OT5 = 8
}

export enum Position {
    GOALIE = "Goalie",
    DEFENDER = "Defender",
    FORWARD = "Forward"
}

export enum Season {
    SEASON_2022_2023 = "2022-2023",
    SEASON_2023_2024 = "2023-2024",
    SEASON_2024_2025 = "2024-2025",
    SEASON_2025_2026 = "2025-2026",
}