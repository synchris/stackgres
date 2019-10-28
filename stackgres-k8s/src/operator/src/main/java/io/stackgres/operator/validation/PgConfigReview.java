/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.validation;

import io.quarkus.runtime.annotations.RegisterForReflection;
import io.stackgres.operator.customresource.sgpgconfig.StackGresPostgresConfig;

@RegisterForReflection
public class PgConfigReview extends AdmissionReview<StackGresPostgresConfig> {

  private static final long serialVersionUID = 1L;
}