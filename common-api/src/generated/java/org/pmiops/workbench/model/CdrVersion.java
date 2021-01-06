package org.pmiops.workbench.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * CdrVersion
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2020-03-10T18:42:30.006Z")

public class CdrVersion   {
  @JsonProperty("cdrVersionId")
  private String cdrVersionId = null;

  @JsonProperty("name")
  private String name = null;

  @JsonProperty("numParticipants")
  private Integer numParticipants = null;

  @JsonProperty("creationTime")
  private Long creationTime = null;

  public CdrVersion cdrVersionId(String cdrVersionId) {
    this.cdrVersionId = cdrVersionId;
    return this;
  }

   /**
   * Get cdrVersionId
   * @return cdrVersionId
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull


  public String getCdrVersionId() {
    return cdrVersionId;
  }

  public void setCdrVersionId(String cdrVersionId) {
    this.cdrVersionId = cdrVersionId;
  }

  public CdrVersion name(String name) {
    this.name = name;
    return this;
  }

   /**
   * Get name
   * @return name
  **/
  @ApiModelProperty(required = true, value = "")
  @NotNull


  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public CdrVersion numParticipants(Integer numParticipants) {
    this.numParticipants = numParticipants;
    return this;
  }

   /**
   * Get numParticipants
   * @return numParticipants
  **/
  @ApiModelProperty(value = "")


  public Integer getNumParticipants() {
    return numParticipants;
  }

  public void setNumParticipants(Integer numParticipants) {
    this.numParticipants = numParticipants;
  }

  public CdrVersion creationTime(Long creationTime) {
    this.creationTime = creationTime;
    return this;
  }

   /**
   * Milliseconds since the UNIX epoch.
   * @return creationTime
  **/
  @ApiModelProperty(required = true, value = "Milliseconds since the UNIX epoch.")
  @NotNull


  public Long getCreationTime() {
    return creationTime;
  }

  public void setCreationTime(Long creationTime) {
    this.creationTime = creationTime;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CdrVersion cdrVersion = (CdrVersion) o;
    return Objects.equals(this.cdrVersionId, cdrVersion.cdrVersionId) &&
        Objects.equals(this.name, cdrVersion.name) &&
        Objects.equals(this.numParticipants, cdrVersion.numParticipants) &&
        Objects.equals(this.creationTime, cdrVersion.creationTime);
  }

  @Override
  public int hashCode() {
    return Objects.hash(cdrVersionId, name, numParticipants, creationTime);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CdrVersion {\n");
    
    sb.append("    cdrVersionId: ").append(toIndentedString(cdrVersionId)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    numParticipants: ").append(toIndentedString(numParticipants)).append("\n");
    sb.append("    creationTime: ").append(toIndentedString(creationTime)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

