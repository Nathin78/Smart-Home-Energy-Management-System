package com.shems.controller;

import com.shems.service.RealtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/realtime")
public class RealtimeController {

    @Autowired
    private RealtimeService realtimeService;

    @GetMapping("/stream")
    public SseEmitter stream(@RequestParam Long userId) {
        return realtimeService.subscribe(userId);
    }
}

