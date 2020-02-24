/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.sidecars.pgbouncer.customresources;

import io.fabric8.kubernetes.client.CustomResourceList;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class StackGresPgbouncerConfigList extends CustomResourceList<StackGresPgbouncerConfig> {

  private static final long serialVersionUID = -1986325130709722399L;

}
