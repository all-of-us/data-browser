import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories({"org.pmiops.workbench.db.dao"})
@EntityScan("org.pmiops.workbench.db.model")
public class CommandLineToolConfig {
    public static void runCommandLine(Class<?> cliConfig, String[] args) {
        new SpringApplicationBuilder(CommandLineToolConfig.class, cliConfig)
                .web(WebApplicationType.NONE)
                .run(args)
                .close();
    }
}

