/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.validation;

import io.quarkus.runtime.annotations.RegisterForReflection;
import io.stackgres.operator.customresource.sgcluster.StackGresCluster;

@RegisterForReflection
public class StackgresClusterReview extends AdmissionReview<StackGresCluster> {

  private static final long serialVersionUID = 1L;

}