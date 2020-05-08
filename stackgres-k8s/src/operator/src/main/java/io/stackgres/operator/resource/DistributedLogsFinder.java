/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.resource;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.stackgres.common.crd.sgdistributedlogs.StackGresDistributedLogs;
import io.stackgres.common.crd.sgdistributedlogs.StackGresDistributedLogsDefinition;
import io.stackgres.common.crd.sgdistributedlogs.StackGresDistributedLogsDoneable;
import io.stackgres.common.crd.sgdistributedlogs.StackGresDistributedLogsList;
import io.stackgres.operator.app.KubernetesClientFactory;
import io.stackgres.operator.common.ArcUtil;

@ApplicationScoped
public class DistributedLogsFinder
    extends AbstractCustomResourceFinder<StackGresDistributedLogs> {

  /**
   * Create a {@code DistributedLogsFinder} instance.
   */
  @Inject
  public DistributedLogsFinder(KubernetesClientFactory clientFactory) {
    super(clientFactory, StackGresDistributedLogsDefinition.NAME,
        StackGresDistributedLogs.class, StackGresDistributedLogsList.class,
        StackGresDistributedLogsDoneable.class);
  }

  public DistributedLogsFinder() {
    super(null, null, null, null, null);
    ArcUtil.checkPublicNoArgsConstructorIsCalledFromArc();
  }

}