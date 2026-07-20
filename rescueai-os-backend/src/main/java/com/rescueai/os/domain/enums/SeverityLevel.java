package com.rescueai.os.domain.enums;

/** 1-10 scale, coarsened into tiers used across the UI and alerting logic. */
public enum SeverityLevel {
    LOW(1, 3),
    MODERATE(4, 6),
    HIGH(7, 8),
    CRITICAL(9, 10);

    private final int minScore;
    private final int maxScore;

    SeverityLevel(int minScore, int maxScore) {
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public static SeverityLevel fromScore(int score) {
        for (SeverityLevel level : values()) {
            if (score >= level.minScore && score <= level.maxScore) {
                return level;
            }
        }
        return score < 1 ? LOW : CRITICAL;
    }
}
