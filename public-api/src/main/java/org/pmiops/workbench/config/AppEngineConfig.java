package org.pmiops.workbench.config;

import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppEngineConfig {

    @Bean
    URLFetchService urlFetchService() {
        return URLFetchServiceFactory.getURLFetchService();
    }

}
