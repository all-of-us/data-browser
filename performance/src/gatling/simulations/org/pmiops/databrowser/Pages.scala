package org.pmiops.databrowser

import io.gatling.core.Predef._
import io.gatling.core.structure.ChainBuilder
import io.gatling.http.Predef._
import io.gatling.http.request.builder.HttpRequestBuilder

/**
  * A "Page" should be a collection of API calls that are made when navigating to a specific
  * destination or performing a limited set of actions. These should be composable so larger
  * scenarios can be built around them - attempt to keep them limited in scope.
  */
object Pages {

  /**
    *
    */
  private object APIs {
    val config: HttpRequestBuilder = http(HomePage.name).get("/v1/config")
    val genderCount: HttpRequestBuilder = http(HomePage.name).get("/v1/databrowser/gender-count")
    def conceptAnalysisResults (conceptIds: Seq[String]): HttpRequestBuilder = {
      http(HomePage.name).get("/v1/databrowser/concept-analysis-results?concept-ids=" + conceptIds.mkString(","))
    }
    val participantCount: HttpRequestBuilder = http(HomePage.name).get("/v1/databrowser/participant-count")
    val domainTotals: HttpRequestBuilder = http(HomePage.name).get("/v1/databrowser/domain-totals")
  }

  object Home {
    val home: ChainBuilder = exec(APIs.config)
      .exec(APIs.genderCount.check(status.is(session => 200)))
      .exec(APIs
        .conceptAnalysisResults(Seq("903118","903115","903133","903121","903135","903136","903126","903111","903120"))
        .check(status.is(session => 200)))
      .exec(APIs.participantCount.check(status.is(session => 200)))
      .exec(APIs.domainTotals.check(status.is(session => 200)))
      .pause(Configuration.defaultPause)
  }

}
