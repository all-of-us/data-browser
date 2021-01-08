package org.pmiops.workbench.api;

import org.pmiops.workbench.model.CdrVersionListResponse;

import io.swagger.annotations.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * A delegate to be called by the {@link CdrVersionsApiController}}.
 * Should be implemented as a controller but without the {@link org.springframework.stereotype.Controller} annotation.
 * Instead, use spring to autowire this class into the {@link CdrVersionsApiController}.
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2020-03-10T18:42:30.006Z")

public interface CdrVersionsApiDelegate {

    /**
     * @see CdrVersionsApi#getCdrVersions
     */
    ResponseEntity<CdrVersionListResponse> getCdrVersions();

}
