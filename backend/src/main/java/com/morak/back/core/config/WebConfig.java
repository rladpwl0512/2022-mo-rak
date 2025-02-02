package com.morak.back.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    public static final String ALLOWED_METHOD_NAMES = "GET,HEAD,POST,PUT,DELETE,TRACE,OPTIONS,PATCH";

    private final String allowedOrigin;
    private final String prometheusOrigin;

    public WebConfig(@Value("${cors.allowed-origin}") String allowedOrigin,
                     @Value("${monitoring.prometheus.origin}") String prometheusOrigin) {
        this.allowedOrigin = allowedOrigin;
        this.prometheusOrigin = prometheusOrigin;
    }

    @Override
    public void addCorsMappings(final CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods(ALLOWED_METHOD_NAMES.split(","))
                .exposedHeaders(HttpHeaders.LOCATION);

        registry.addMapping("/actuator/**")
                .allowedOrigins(prometheusOrigin)
                .allowedMethods("GET", "HEAD", "OPTIONS");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/docs/index.html")
                .addResourceLocations("classpath:/static/");
    }
}
