package org.pmiops.databrowser

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.concurrent.duration._
import scala.language.postfixOps

class TestRunner extends Simulation {

  val httpConf: HttpProtocolBuilder = http.
    baseUrl(Configuration.defaultUrl).
    userAgentHeader(Configuration.userAgentHeader)

  setUp(Scenarios.userScenarios.map(s => s.inject(rampUsers(5) during(10 seconds))))
    .assertions(forAll.failedRequests.percent.lte(5))
    .protocols(httpConf)

}
