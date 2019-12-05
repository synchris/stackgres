/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.customresource.sgcluster;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.common.base.MoreObjects;
import io.fabric8.kubernetes.api.model.KubernetesResource;
import io.quarkus.runtime.annotations.RegisterForReflection;
import io.stackgres.operator.resource.dto.ClusterPodStatus;

@JsonDeserialize
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
@RegisterForReflection
public class StackGresClusterStatus implements KubernetesResource {

  private static final long serialVersionUID = 4714141925270158016L;

  @JsonProperty("pods")
  private List<ClusterPodStatus> pods;

  @JsonProperty("podsReady")
  private String podsReady;

  @JsonProperty("conditions")
  @JsonInclude(JsonInclude.Include.NON_EMPTY)
  private List<StackGresClusterCondition> conditions = new ArrayList<>();

  public List<ClusterPodStatus> getPods() {
    return pods;
  }

  public void setPods(List<ClusterPodStatus> pods) {
    this.pods = pods;
  }

  public String getPodsReady() {
    return podsReady;
  }

  public void setPodsReady(String podsReady) {
    this.podsReady = podsReady;
  }

  public List<StackGresClusterCondition> getConditions() {
    return conditions;
  }

  public void setConditions(List<StackGresClusterCondition> conditions) {
    this.conditions = conditions;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
        .omitNullValues()
        .add("pods", pods)
        .add("podsReady", podsReady)
        .add("conditions", conditions)
        .toString();
  }

}
