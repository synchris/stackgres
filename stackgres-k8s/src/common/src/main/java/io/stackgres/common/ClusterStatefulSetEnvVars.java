/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.common;

import java.util.function.Function;

import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.EnvVarBuilder;

public enum ClusterStatefulSetEnvVars {
  POSTGRES_VERSION(context -> context.getCluster().getSpec().getPostgresVersion()),
  POSTGRES_MAJOR_VERSION(context -> StackGresComponent.POSTGRESQL.findMajorVersion(
      context.getCluster().getSpec().getPostgresVersion())),
  BUILD_VERSION(context -> StackGresComponent.POSTGRESQL.findBuildVersion(
      context.getCluster().getSpec().getPostgresVersion())),
  BUILD_MAJOR_VERSION(context -> StackGresComponent.POSTGRESQL.findBuildMajorVersion(
      context.getCluster().getSpec().getPostgresVersion())),
  PATRONI_ENV("patroni"),
  BACKUP_ENV("backup"),
  RESTORE_ENV("restore"),
  POSTGRES_ENTRY_PORT(String.valueOf(EnvoyUtil.PG_ENTRY_PORT)),
  POSTGRES_REPL_ENTRY_PORT(String.valueOf(EnvoyUtil.PG_REPL_ENTRY_PORT)),
  POSTGRES_POOL_PORT(String.valueOf(EnvoyUtil.PG_POOL_PORT)),
  POSTGRES_PORT(String.valueOf(EnvoyUtil.PG_PORT)),
  LOCK_TIMEOUT(String.valueOf(60)),
  LOCK_SLEEP(String.valueOf(5));

  private final String substVar;
  private final Function<ClusterContext, EnvVar> getEnvVar;

  ClusterStatefulSetEnvVars(String value) {
    this.substVar = getSubstVar();
    EnvVar envVar = new EnvVarBuilder()
        .withName(name())
        .withValue(value)
        .build();
    this.getEnvVar = context -> envVar;
  }

  ClusterStatefulSetEnvVars(Function<ClusterContext, String> getValue) {
    this.substVar = getSubstVar();
    this.getEnvVar = context -> new EnvVarBuilder()
        .withName(name())
        .withValue(getValue.apply(context))
        .build();
  }

  private String getSubstVar() {
    return "$(" + name() + ")";
  }

  public String substVar() {
    return substVar;
  }

  public String value(ClusterContext context) {
    return getEnvVar.apply(context).getValue();
  }

  public EnvVar envVar(ClusterContext context) {
    return getEnvVar.apply(context);
  }
}
