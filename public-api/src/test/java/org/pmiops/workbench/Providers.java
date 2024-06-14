package org.pmiops.workbench;

import jakarta.inject.Provider;

public class Providers {

    public static <T> Provider<T> of(final T t) {
        return () -> t;
    }

}
