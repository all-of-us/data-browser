package org.pmiops.workbench.config;

import org.pmiops.workbench.interceptors.ClearCdrVersionContextInterceptor;

import org.pmiops.workbench.interceptors.SecurityHeadersInterceptor;

import jakarta.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.XADataSourceAutoConfiguration;
import org.springframework.context.annotation.*;

@EnableWebMvc
@Configuration
@Import({XADataSourceAutoConfiguration.class, PropertyPlaceholderAutoConfiguration.class})
public class PublicApiWebMvcConfig implements WebMvcConfigurer {

  @Autowired
  private ClearCdrVersionContextInterceptor clearCdrVersionInterceptor;

  @Autowired
  private SecurityHeadersInterceptor securityHeadersInterceptor;

  @Override
  public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
    configurer.defaultContentType(MediaType.APPLICATION_JSON);
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(clearCdrVersionInterceptor);
    registry.addInterceptor(securityHeadersInterceptor);
  }

  static ServletContext getRequestServletContext() {
    return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
            .getRequest()
            .getServletContext();
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
            .addMapping("/**")
            .allowedMethods("GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "TRACE", "OPTIONS")
            .allowedOrigins("*")
            .allowedHeaders("*")
            .exposedHeaders("Origin, X-Requested-With, Content-Type, Accept, Authorization");
  }
}