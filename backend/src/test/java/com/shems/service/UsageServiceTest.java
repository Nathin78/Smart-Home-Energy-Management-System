package com.shems.service;

import com.shems.repository.DeviceRepository;
import com.shems.repository.UsageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsageServiceTest {

    @Mock
    private UsageRepository usageRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @InjectMocks
    private UsageService usageService;

    @Test
    void getUsageForUserDevices_whenNoDevices_returnsEmpty_andSkipsQuery() {
        when(deviceRepository.findByUserId(123L)).thenReturn(Collections.emptyList());

        var result = usageService.getUsageForUserDevices(123L, LocalDate.now().minusDays(7), LocalDate.now());

        assertThat(result).isEmpty();
        verify(deviceRepository).findByUserId(123L);
        verifyNoInteractions(usageRepository);
    }

    @Test
    void getTotalConsumptionForUser_whenNoDevices_returnsZero_andSkipsQuery() {
        when(deviceRepository.findByUserId(123L)).thenReturn(Collections.emptyList());

        var result = usageService.getTotalConsumptionForUser(123L, LocalDate.now().minusDays(7), LocalDate.now());

        assertThat(result).isEqualTo(0.0);
        verify(deviceRepository).findByUserId(123L);
        verifyNoInteractions(usageRepository);
    }
}
