package org.pmiops.databrowser

import io.gatling.core.Predef.scenario
import io.gatling.core.structure.ScenarioBuilder

sealed trait UserScenario { val name: String }
case object HomePage extends UserScenario { val name = "Home Page" }

/**
  * User scenarios are defined here. Scenarios can be comprised of different Pages.
  */
object Scenarios {

  val userScenarios: List[ScenarioBuilder] = List(
    scenario(HomePage.name).exec(Pages.Home.home),
  )

}

