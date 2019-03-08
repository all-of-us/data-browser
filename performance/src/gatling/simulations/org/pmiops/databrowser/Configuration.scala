package org.pmiops.databrowser

object Configuration {

  val env: String = System.getProperty("env", "stable")
  val defaultPause: Int = 3
  val userAgentHeader: String = "Gatling Performance Testing"
  val defaultUrl: String = {
    env match {
      case "prod" => "https://databrowser.researchallofus.org"
      case "stable" => "https://www.databrowser.stable.fake-research-aou.org"
      case _ => "https://aou-db-test.appspot.com"
    }
  }

}
