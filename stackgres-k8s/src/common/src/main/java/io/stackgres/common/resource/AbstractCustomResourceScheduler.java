/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.common.resource;

import java.util.function.BiConsumer;
import java.util.function.Function;

import io.fabric8.kubernetes.api.model.HasMetadata;
import io.fabric8.kubernetes.client.CustomResource;
import io.fabric8.kubernetes.client.CustomResourceList;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.dsl.Namespaceable;
import io.fabric8.kubernetes.client.dsl.NonNamespaceOperation;
import io.fabric8.kubernetes.client.dsl.Resource;
import io.stackgres.common.KubernetesClientFactory;

public abstract class AbstractCustomResourceScheduler
    <T extends CustomResource<?, ?>, L extends CustomResourceList<T>>
    implements CustomResourceScheduler<T> {

  private final KubernetesClientFactory clientFactory;

  private final Class<T> customResourceClass;
  private final Class<L> customResourceListClass;

  protected AbstractCustomResourceScheduler(
      KubernetesClientFactory clientFactory,
      Class<T> customResourceClass,
      Class<L> customResourceListClass) {
    this.clientFactory = clientFactory;
    this.customResourceClass = customResourceClass;
    this.customResourceListClass = customResourceListClass;
  }

  @Override
  public void create(T resource) {
    try (KubernetesClient client = clientFactory.create()) {
      getCustomResourceEndpoints(client)
          .inNamespace(resource.getMetadata().getNamespace())
          .create(resource);
    }
  }

  @Override
  public void update(T resource) {
    try (KubernetesClient client = clientFactory.create()) {
      getCustomResourceEndpoints(client)
          .inNamespace(resource.getMetadata().getNamespace())
          .withName(resource.getMetadata().getName())
          .patch(resource);
    }
  }

  @Override
  public <S> void updateStatus(T resource, Function<T, S> statusGetter,
      BiConsumer<T, S> statusSetter) {
    try (KubernetesClient client = clientFactory.create()) {
      T resourceOverwrite = getCustomResourceEndpoints(client)
          .inNamespace(resource.getMetadata().getNamespace())
          .withName(resource.getMetadata().getName())
          .get();
      if (resourceOverwrite == null) {
        throw new RuntimeException("Can not update status of resource "
            + HasMetadata.getKind(customResourceClass)
            + "." + HasMetadata.getGroup(customResourceClass)
            + " " + resource.getMetadata().getNamespace()
            + "." + resource.getMetadata().getName()
            + ": resource not found");
      }
      statusSetter.accept(resourceOverwrite, statusGetter.apply(resource));
      getCustomResourceEndpoints(client)
          .inNamespace(resource.getMetadata().getNamespace())
          .withName(resource.getMetadata().getName())
          .lockResourceVersion(resource.getMetadata().getResourceVersion())
          .replace(resourceOverwrite);
    } catch (KubernetesClientException ex) {
      throw new KubernetesClientStatusUpdateException(ex);
    }
  }

  @Override
  public void delete(T resource) {
    try (KubernetesClient client = clientFactory.create()) {
      getCustomResourceEndpoints(client)
          .inNamespace(resource.getMetadata().getNamespace())
          .withName(resource.getMetadata().getName())
          .delete();
    }
  }

  private Namespaceable<NonNamespaceOperation<T, L, Resource<T>>> getCustomResourceEndpoints(
      KubernetesClient client) {
    return client.customResources(customResourceClass, customResourceListClass);
  }

}
