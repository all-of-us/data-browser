package org.pmiops.workbench.model;

import static com.google.common.truth.Truth.assertThat;
import static com.google.common.truth.Truth.assertWithMessage;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.function.Function;
import org.junit.jupiter.api.Test;
import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;


import org.pmiops.workbench.model.Domain;

public class CommonStorageEnumsTest {

  @ParameterizedTest(name = "{0}")
  @MethodSource("data")
  public void testBijectiveStorageMapping(String description, Enum<?>[] enumValues,
                                          Function<Short, Enum<?>> fromStorage,
                                          Function<Enum<?>, Short> toStorage) {
    for (Enum<?> v : enumValues) {
      Short storageValue = toStorage.apply(v);
      assertEquals(v, fromStorage.apply(storageValue), "unmapped enum value: " + v);
    }
  }

  public static Stream<Arguments> data() {
    return Stream.of(
            Arguments.of(
                    Domain.class.getSimpleName(),
                    Domain.values(),
                    (Function<Short, Enum<?>>) CommonStorageEnums::domainFromStorage,
                    (Function<Enum<?>, Short>) CommonStorageEnums::domainToStorage
            )
    );
  }
}