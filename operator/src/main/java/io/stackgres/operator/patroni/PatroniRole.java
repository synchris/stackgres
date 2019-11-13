/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.patroni;

import io.fabric8.kubernetes.api.model.ServiceAccount;
import io.fabric8.kubernetes.api.model.ServiceAccountBuilder;
import io.fabric8.kubernetes.api.model.rbac.PolicyRuleBuilder;
import io.fabric8.kubernetes.api.model.rbac.Role;
import io.fabric8.kubernetes.api.model.rbac.RoleBinding;
import io.fabric8.kubernetes.api.model.rbac.RoleBindingBuilder;
import io.fabric8.kubernetes.api.model.rbac.RoleBuilder;
import io.fabric8.kubernetes.api.model.rbac.RoleRefBuilder;
import io.fabric8.kubernetes.api.model.rbac.SubjectBuilder;
import io.stackgres.common.customresource.sgcluster.StackGresCluster;
import io.stackgres.common.resource.ResourceUtil;

public class PatroniRole {

  public static final String SUFFIX = "-patroni";

  /**
   * Create the ServiceAccount for patroni associated to the cluster.
   */
  public static ServiceAccount createServiceAccount(StackGresCluster cluster) {
    return new ServiceAccountBuilder()
          .withNewMetadata()
          .withName(cluster.getMetadata().getName() + SUFFIX)
          .withNamespace(cluster.getMetadata().getNamespace())
          .withLabels(ResourceUtil.defaultLabels(cluster.getMetadata().getName()))
          .endMetadata()
          .build();
  }

  /**
   * Create the Role for patroni associated to the cluster.
   */
  public static Role createRole(StackGresCluster cluster) {
    return new RoleBuilder()
        .withNewMetadata()
        .withName(cluster.getMetadata().getName() + SUFFIX)
        .withNamespace(cluster.getMetadata().getNamespace())
        .withLabels(ResourceUtil.defaultLabels(cluster.getMetadata().getName()))
        .endMetadata()
        .addToRules(new PolicyRuleBuilder()
            .withApiGroups("")
            .withResources("endpoints", "configmaps")
            .withVerbs("create", "get", "list", "patch", "update", "watch")
            .build())
        .addToRules(new PolicyRuleBuilder()
            .withApiGroups("")
            .withResources("secrets")
            .withVerbs("get")
            .build())
        .addToRules(new PolicyRuleBuilder()
            .withApiGroups("")
            .withResources("pods")
            .withVerbs("get", "list", "patch", "update", "watch")
            .build())
        .addToRules(new PolicyRuleBuilder()
            .withApiGroups("")
            .withResources("services")
            .withVerbs("create")
            .build())
        .build();
  }

  /**
   * Create the RoleBinding for patroni associated to the cluster.
   */
  public static RoleBinding createRoleBinding(StackGresCluster cluster) {
    return new RoleBindingBuilder()
        .withNewMetadata()
        .withName(cluster.getMetadata().getName() + SUFFIX)
        .withNamespace(cluster.getMetadata().getNamespace())
        .withLabels(ResourceUtil.defaultLabels(cluster.getMetadata().getName()))
        .endMetadata()
        .withSubjects(new SubjectBuilder()
            .withKind("ServiceAccount")
            .withName(cluster.getMetadata().getName() + SUFFIX)
            .withNamespace(cluster.getMetadata().getNamespace())
            .build())
        .withRoleRef(new RoleRefBuilder()
            .withKind("Role")
            .withName(cluster.getMetadata().getName() + SUFFIX)
            .withApiGroup("rbac.authorization.k8s.io")
            .build())
        .build();
  }

}