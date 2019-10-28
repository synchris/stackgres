/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.validation;

import java.util.UUID;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.quarkus.runtime.StartupEvent;
import io.stackgres.operator.customresource.sgcluster.StackGresCluster;
import io.stackgres.operator.validation.cluster.ClusterValidationPipeline;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/stackgres/validation/cluster")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClusterValidationResource {

  private static final Logger LOGGER = LoggerFactory.getLogger(ClusterValidationResource.class);

  private ClusterValidationPipeline pipeline;

  @Inject
  public ClusterValidationResource(ClusterValidationPipeline pipeline) {
    this.pipeline = pipeline;
  }

  void onStart(@Observes StartupEvent ev) {
    LOGGER.info("Cluster validation resource started");
  }

  /**
   * Admission Web hook callback.
   */
  @POST
  public AdmissionReviewResponse validate(StackgresClusterReview admissionReview) {

    AdmissionRequest<StackGresCluster> request = admissionReview.getRequest();
    UUID requestUid = request.getUid();
    LOGGER.info("Validating admission review " + requestUid.toString()
        + " of kind " + request.getKind().toString());

    AdmissionResponse response = new AdmissionResponse();
    response.setUid(requestUid);

    AdmissionReviewResponse reviewResponse = new AdmissionReviewResponse();
    reviewResponse.setResponse(response);

    reviewResponse.setGroup(admissionReview.getGroup());
    reviewResponse.setKind(admissionReview.getKind());
    reviewResponse.setVersion(admissionReview.getVersion());

    try {
      pipeline.validate(admissionReview);
      response.setAllowed(true);
    } catch (ValidationFailed validationFailed) {
      Result result = validationFailed.getResult();
      LOGGER.error("cannot proceed with request "
          + requestUid.toString() + " cause: " + result.getMessage());
      response.setAllowed(false);
      response.setStatus(result);
    }

    return reviewResponse;

  }

}