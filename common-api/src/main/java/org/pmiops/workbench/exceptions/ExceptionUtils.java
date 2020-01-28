package org.pmiops.workbench.exceptions;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import java.io.IOException;
import java.net.SocketTimeoutException;
import javax.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;

/** Utility methods related to exceptions. */
public class ExceptionUtils {

    public static boolean isGoogleServiceUnavailableException(Exception e) {
        // We assume that any 500 range error for Google is something we should retry.
        if (e instanceof GoogleJsonResponseException) {
            int code = ((GoogleJsonResponseException) e).getDetails().getCode();
            return code >= 500 && code < 600;
        }
        return false;
    }

    public static boolean isGoogleConflictException(Exception e) {
        if (e instanceof GoogleJsonResponseException) {
            int code = ((GoogleJsonResponseException) e).getDetails().getCode();
            return code == 409;
        }
        return false;
    }

    public static DataBrowserException convertGoogleIOException(Exception e) {
        if (isGoogleServiceUnavailableException(e)) {
            throw new ServerUnavailableException(e);
        } else if (isGoogleConflictException(e)) {
            throw new ConflictException(e);
        }
        throw new ServerErrorException(e);
    }

    public static boolean isSocketTimeoutException(Throwable e) {
        return (e instanceof SocketTimeoutException);
    }


    public static boolean isServiceUnavailable(int code) {
        return code == HttpServletResponse.SC_SERVICE_UNAVAILABLE
                || code == HttpServletResponse.SC_BAD_GATEWAY;
    }

    private static RuntimeException codeToException(int code) {

        if (code == HttpStatus.NOT_FOUND.value()) {
            return new NotFoundException();
        } else if (code == HttpServletResponse.SC_BAD_REQUEST) {
            return new BadRequestException();
        } else if (code == HttpServletResponse.SC_FORBIDDEN) {
            return new ForbiddenException();
        } else if (isServiceUnavailable(code)) {
            return new ServerUnavailableException();
        } else if (code == HttpServletResponse.SC_GATEWAY_TIMEOUT) {
            return new GatewayTimeoutException();
        } else {
            return new ServerErrorException();
        }
    }

    private ExceptionUtils() {}
}
