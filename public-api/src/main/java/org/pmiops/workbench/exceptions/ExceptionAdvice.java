package org.pmiops.workbench.exceptions;


import java.util.logging.Level;
import java.util.logging.Logger;
import org.pmiops.workbench.model.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import java.util.*;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.http.HttpStatus;
import org.springframework.core.annotation.Order;
import java.util.stream.Collectors;
import org.springframework.core.Ordered;

@ControllerAdvice
public class ExceptionAdvice{

  private static final Logger log = Logger.getLogger(ExceptionAdvice.class.getName());

  @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentNotValidException.class})
  public ResponseEntity<?> messageNotReadableError(Exception e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
        DataBrowserException.errorResponse(e.getMessage())
            .statusCode(HttpStatus.BAD_REQUEST.value()));
  }

  @ExceptionHandler({Exception.class})
  public ResponseEntity<?> serverError(Exception e) {
    ErrorResponse errorResponse = new ErrorResponse()
        .message("unknown error");
    Integer statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();

    // if this error was thrown by another error, get the info from that exception
    Throwable relevantError = e;
    if (e.getCause() != null) {
      relevantError = e.getCause();
    }

    // if exception class has an HTTP status associated with it, grab it
    if (relevantError.getClass().getAnnotation(ResponseStatus.class) != null) {
      statusCode = relevantError.getClass().getAnnotation(ResponseStatus.class).value().value();
    }
    if (relevantError instanceof DataBrowserException) {
      // Only include Exception details on Workbench errors.
      errorResponse.setMessage(relevantError.getMessage());
      errorResponse.setErrorClassName(relevantError.getClass().getName());
      DataBrowserException dataBrowserException = (DataBrowserException) relevantError;
      if (dataBrowserException.getErrorResponse() != null
          && dataBrowserException.getErrorResponse().getErrorCode() != null) {
        errorResponse.setErrorCode(dataBrowserException.getErrorResponse().getErrorCode());
      }
    }

    // only log error if it's a server error
    if (statusCode >= 500) {
      log.log(Level.SEVERE, relevantError.getClass().getName(), e);
    }

    errorResponse.setStatusCode(statusCode);
    return ResponseEntity.status(statusCode).body(errorResponse);
  }
}