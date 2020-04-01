/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.initialization;

import javax.enterprise.context.ApplicationScoped;

import io.stackgres.operator.sidecars.pooling.customresources.StackGresPoolingConfig;

@ApplicationScoped
public class PgBouncerInitializer extends
    AbstractDefaultCustomResourceInitializer<StackGresPoolingConfig> {

}
