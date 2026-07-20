package com.rescueai.os.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** What a citizen (or a sensor integration) submits. Everything downstream is agent-derived. */
@Data
public class IncidentReportRequest {
    @NotBlank private String rawText;
    @NotNull  private Double latitude;
    @NotNull  private Double longitude;
    private String mediaUrls; // comma-separated, optional
}
