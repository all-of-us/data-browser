package org.pmiops.workbench.db.model;

import com.google.common.collect.BiMap;
import com.google.common.collect.ImmutableBiMap;
import org.pmiops.workbench.model.Domain;

public class CommonStorageEnums {

  private static final BiMap<Domain, Short> CLIENT_TO_STORAGE_DOMAIN =
      ImmutableBiMap.<Domain, Short>builder()
          .put(Domain.CONDITION, (short) 0)
          .put(Domain.DEATH, (short) 1)
          .put(Domain.DEVICE, (short) 2)
          .put(Domain.DRUG, (short) 3)
          .put(Domain.MEASUREMENT, (short) 4)
          .put(Domain.OBSERVATION, (short) 5)
          .put(Domain.PROCEDURE, (short) 6)
          .put(Domain.VISIT, (short) 7)
          .build();

  // A mapping from our Domain enum to OMOP domain ID values.
  private static final BiMap<Domain, String> DOMAIN_ID_MAP =
      ImmutableBiMap.<Domain, String>builder()
          .put(Domain.CONDITION, "Condition")
          .put(Domain.DEATH, "Death")
          .put(Domain.DEVICE, "Device")
          .put(Domain.DRUG, "Drug")
          .put(Domain.MEASUREMENT, "Measurement")
          .put(Domain.OBSERVATION, "Observation")
          .put(Domain.PROCEDURE, "Procedure")
          .put(Domain.VISIT, "Visit")
          .build();

  public static Domain domainFromStorage(Short domain) {
    return CLIENT_TO_STORAGE_DOMAIN.inverse().get(domain);
  }

  public static Short domainToStorage(Domain domain) {
    return CLIENT_TO_STORAGE_DOMAIN.get(domain);
  }

  public static String domainToDomainId(Domain domain) {
    return DOMAIN_ID_MAP.get(domain);
  }

  public static Domain domainIdToDomain(String domainId) {
    return DOMAIN_ID_MAP.inverse().get(domainId);
  }

}
