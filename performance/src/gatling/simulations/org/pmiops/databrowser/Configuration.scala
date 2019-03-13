package org.pmiops.databrowser

import scala.concurrent.duration._
import scala.language.postfixOps

object Configuration {

  val env: String = System.getProperty("env", "stable")
  val defaultPause: Int = 3
  val defaultMaxResponseTime: Int = 15000
  val defaultFailedRequestsLimit: Int = 0
  val defaultRampUsers: Int = 5
  val defaultRampTime: FiniteDuration = 10 seconds
  val userAgentHeader: String = "Gatling Performance Testing"
  val defaultUrl: String = {
    env match {
      case "prod" => "https://public.api.researchallofus.org"
      case "stable" => "https://public.api.stable.fake-research-aou.org"
      case "staging" => "https://api-dot-aou-db-staging.appspot.com"
      case _ => "https://api-dot-aou-db-test.appspot.com"
    }
  }

}
