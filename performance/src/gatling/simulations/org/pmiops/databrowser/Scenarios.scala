package org.pmiops.databrowser

import io.gatling.core.Predef.scenario
import io.gatling.core.structure.ScenarioBuilder

sealed trait UserScenario { val name: String }
case object HomePage extends UserScenario { val name = "Home Page" }
case object UserStorySmoking extends UserScenario { val name = "User Story: Smoking" }

/**
  * User scenarios are defined here. Scenarios can be comprised of different Pages.
  */
object Scenarios {

  val homePage: ScenarioBuilder = scenario(HomePage.name)
    .exec(Pages.Home.home)

  // TODO: Current user story seems incorrect, need to flesh this out more.
  val smokingSearch: ScenarioBuilder = scenario(UserStorySmoking.name)
    .exec(Pages.Home.home)
    .exec(Pages.SmokingSearch.search)
    .exec(Pages.ViewSmokingProcedures.view)
    .exec(Pages.Home.home)

  val allScenarios: List[ScenarioBuilder] = List(homePage, smokingSearch)

}
