package com.shems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardPreferencesRequest {
    private Boolean energyAlerts;
    private Boolean emailNotifications;
    private Boolean weeklyReports;
    private Boolean peakAlerts;
    private Integer monthlyTargetKwh;
}

