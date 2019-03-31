package org.pmiops.databrowser

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.http.protocol.HttpProtocolBuilder

import scala.language.postfixOps

class BasicSimulation extends Simulation {

  val config: Configuration.type = Configuration

  val httpConf: HttpProtocolBuilder = http.
    baseUrl(config.defaultUrl).
    disableCaching.
    userAgentHeader(config.userAgentHeader)

  def globalAssertions: List[Assertion] = List(
    forAll.failedRequests.percent.is(config.defaultFailedRequestsLimit),
    global.responseTime.max.lt(config.defaultMaxResponseTime)
  )

  setUp(
    Scenarios.configuredScenarios.map { cs =>
      cs.builder.inject(constantUsersPerSec(cs.users) during cs.time)
    })
    .assertions(globalAssertions)
    .protocols(httpConf)

}
