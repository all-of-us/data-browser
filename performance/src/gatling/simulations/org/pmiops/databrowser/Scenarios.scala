package org.pmiops.databrowser

import io.gatling.core.Predef.scenario
import io.gatling.core.structure.ScenarioBuilder

sealed trait UserScenario { val name: String }
case object HomePage extends UserScenario { val name = "Home Page" }
case object QuickSearch extends UserScenario { val name = "Quick Search" }

/**
  * User scenarios are defined here. Scenarios can be comprised of different Pages.
  * Pages can either be real html pages (so we can test page load) or API calls, but
  * should be composable so larger scenarios can be built around them.
  */
object Scenarios {

  val userScenarios: List[ScenarioBuilder] = List(
    scenario(HomePage.name).exec(Pages.Home.home),
    scenario(QuickSearch.name).exec(Pages.Search.search)
  )

}

