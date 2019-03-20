package org.pmiops.workbench;

import javax.inject.Provider;

public class Providers {

    public static <T> Provider<T> of(final T t) {
        return () -> t;
    }

}
