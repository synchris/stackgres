/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.validation;

import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.quarkus.runtime.StartupEvent;
import io.stackgres.operator.validation.cluster.ClusterValidationPipeline;
import io.stackgres.operatorframework.AdmissionReviewResponse;
import io.stackgres.operatorframework.ValidationResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/stackgres/validation/sgcluster")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClusterValidationResource implements ValidationResource<StackgresClusterReview> {

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

    return validate(admissionReview, pipeline);

  }

}