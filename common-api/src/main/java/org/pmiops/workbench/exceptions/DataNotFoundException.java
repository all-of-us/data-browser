package org.pmiops.workbench.exceptions;

import org.pmiops.workbench.model.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason="Data not found")
public class DataNotFoundException extends DataBrowserException {
    public DataNotFoundException() {
        super();
    }

    public DataNotFoundException(String message) {
        super(message);
    }

    public DataNotFoundException(ErrorResponse errorResponse) {
        super(errorResponse);
    }

    public DataNotFoundException(Throwable t) {
        super(t);
    }

    public DataNotFoundException(String message, Throwable t) {
        super(message, t);
    }
}