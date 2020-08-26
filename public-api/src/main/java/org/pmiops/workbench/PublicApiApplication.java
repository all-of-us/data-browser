package org.pmiops.workbench;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PublicApiApplication {

  public static void main(String[] args) {
    System.out.println("Hot reload test");
    System.out.println("Hot reload test2");
    System.out.println("Hot reload test 3");
    SpringApplication.run(PublicApiApplication.class, args);
  }
}
