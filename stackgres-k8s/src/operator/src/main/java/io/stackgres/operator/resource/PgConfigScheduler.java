/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.resource;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.stackgres.operator.app.KubernetesClientFactory;
import io.stackgres.operator.common.ArcUtil;
import io.stackgres.operator.customresource.sgpgconfig.StackGresPostgresConfig;
import io.stackgres.operator.customresource.sgpgconfig.StackGresPostgresConfigDefinition;
import io.stackgres.operator.customresource.sgpgconfig.StackGresPostgresConfigDoneable;
import io.stackgres.operator.customresource.sgpgconfig.StackGresPostgresConfigList;

@ApplicationScoped
public class PgConfigScheduler
    extends AbstractCustomResourceScheduler<StackGresPostgresConfig,
      StackGresPostgresConfigList, StackGresPostgresConfigDoneable> {

  @Inject
  public PgConfigScheduler(KubernetesClientFactory clientFactory) {
    super(clientFactory, StackGresPostgresConfigDefinition.NAME, StackGresPostgresConfig.class,
        StackGresPostgresConfigList.class, StackGresPostgresConfigDoneable.class);
  }

  public PgConfigScheduler() {
    super(null, null, null, null, null);
    ArcUtil.checkPublicNoArgsConstructorIsCalledFromArc();
  }

}
