package org.pmiops.databrowser

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.concurrent.duration._
import scala.language.postfixOps

class BasicSimulation extends Simulation {

  val httpConf: HttpProtocolBuilder = http.
    baseUrl(Configuration.defaultUrl).
    userAgentHeader(Configuration.userAgentHeader)

  def globalAssertions: List[Assertion] = List(
    forAll.failedRequests.percent.is(0),
    global.responseTime.max.lt(15000)
  )

  setUp(Scenarios.userScenarios.map(s => s.inject(rampUsers(5) during(10 seconds))))
    .assertions(globalAssertions)
    .protocols(httpConf)

}
