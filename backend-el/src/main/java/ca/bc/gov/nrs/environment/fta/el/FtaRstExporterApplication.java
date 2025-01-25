package ca.bc.gov.nrs.environment.fta.el;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FtaRstExporterApplication {

	public static void main(String[] args) {
		SpringApplication.run(FtaRstExporterApplication.class, args);
	}

}
