package org.pmiops.databrowser

import io.gatling.core.Predef._
import io.gatling.core.structure.ChainBuilder
import io.gatling.http.Predef._

object Pages {

  object Home {
    val home: ChainBuilder = exec(http(HomePage.name)
      .get("/")
      .check(status.is(session => 200)))
      .pause(Configuration.defaultPause)
  }

  object Search {
    val search: ChainBuilder = Home.home
      .exec(http(QuickSearch.name).get("/quick-search")
        .check(status.is(session => 200)))
      .pause(Configuration.defaultPause)
  }

}
