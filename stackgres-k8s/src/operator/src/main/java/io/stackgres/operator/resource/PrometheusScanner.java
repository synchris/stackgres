/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.resource;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.stackgres.operator.app.KubernetesClientFactory;
import io.stackgres.operator.common.ArcUtil;
import io.stackgres.operator.customresource.prometheus.PrometheusConfig;
import io.stackgres.operator.customresource.prometheus.PrometheusConfigDefinition;
import io.stackgres.operator.customresource.prometheus.PrometheusConfigDoneable;
import io.stackgres.operator.customresource.prometheus.PrometheusConfigList;

@ApplicationScoped
public class PrometheusScanner
    extends AbstractCustomResourceScanner<PrometheusConfig, PrometheusConfigList,
    PrometheusConfigDoneable> {

  /**
   * Create a {@code PrometheusScanner} instance.
   */
  @Inject
  public PrometheusScanner(KubernetesClientFactory clientFactory) {
    super(clientFactory, PrometheusConfigDefinition.NAME,
        PrometheusConfig.class, PrometheusConfigList.class,
        PrometheusConfigDoneable.class);
  }

  public PrometheusScanner() {
    super(null, null, null, null, null);
    ArcUtil.checkPublicNoArgsConstructorIsCalledFromArc();
  }

}
