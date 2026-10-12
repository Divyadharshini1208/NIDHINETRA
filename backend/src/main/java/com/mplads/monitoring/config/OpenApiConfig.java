package com.mplads.monitoring.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("NIDHINETRA — AI-Powered Public Fund Intelligence Platform REST API")
                        .version("1.0.0")
                        .description("Official backend service for NIDHINETRA: Nationwide monitoring of MPLADS funds, development works, financial anomalies, project progress, and implementation risks across India.\n\n" +
                                "Every Rupee in Sight. Every Project in Focus.")
                        .contact(new Contact()
                                .name("MoSPI Technical Directorate")
                                .email("mplads-support@nic.in")
                                .url("https://www.mospi.gov.in"))
                        .license(new License()
                                .name("Government Open Data License - India")
                                .url("https://data.gov.in")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT Bearer token obtained from `/api/auth/login`")));
    }
}
