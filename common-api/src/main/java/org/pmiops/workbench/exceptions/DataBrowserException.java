package org.pmiops.workbench.exceptions;

import org.pmiops.workbench.model.ErrorCode;
import org.pmiops.workbench.model.ErrorResponse;

public class DataBrowserException extends RuntimeException {

    private ErrorResponse errorResponse;

    public DataBrowserException() {
        super();
    }

    public DataBrowserException(String message) {
        this(errorResponse(message));
    }

    public DataBrowserException(ErrorResponse errorResponse) {
        super(errorResponse.getMessage());
        this.errorResponse = errorResponse;
    }

    public DataBrowserException(Throwable t) {
        super(t);
    }

    public DataBrowserException(String message, Throwable t) {
        super(message, t);
        this.errorResponse = errorResponse(message);
    }

    public ErrorResponse getErrorResponse() {
        return errorResponse;
    }

    public static ErrorResponse errorResponse(String message) {
        return errorResponse(null, message);
    }

    public static ErrorResponse errorResponse(ErrorCode code, String message) {
        ErrorResponse response = new ErrorResponse();
        response.setMessage(message);
        response.setErrorCode(code);
        return response;
    }
}
