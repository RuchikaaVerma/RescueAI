package com.rescueai.os.dto.response;

import com.rescueai.os.domain.entity.Incident;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class IncidentResponse {
    private UUID id;
    private String type;
    private String severityLevel;
    private Integer severityScore;
    private String status;
    private Double latitude;
    private Double longitude;
    private String description;
    private Double predictedSpreadRadiusM;
    private Double verificationConfidence;
    private Instant reportedAt;

    public static IncidentResponse from(Incident i) {
        return IncidentResponse.builder()
                .id(i.getId())
                .type(i.getType() != null ? i.getType().name() : null)
                .severityLevel(i.getSeverityLevel() != null ? i.getSeverityLevel().name() : null)
                .severityScore(i.getSeverityScore())
                .status(i.getStatus().name())
                .latitude(i.getLatitude())
                .longitude(i.getLongitude())
                .description(i.getDescription())
                .predictedSpreadRadiusM(i.getPredictedSpreadRadiusM())
                .verificationConfidence(i.getVerificationConfidence())
                .reportedAt(i.getReportedAt())
                .build();
    }
}
