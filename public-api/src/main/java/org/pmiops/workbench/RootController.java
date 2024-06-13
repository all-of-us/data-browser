package org.pmiops.workbench;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

  @RequestMapping("/")
  public String index() {
    System.out.println("~~~~~~~!!!!!RootController");
    return "AllOfUs Public API";
  }
}
