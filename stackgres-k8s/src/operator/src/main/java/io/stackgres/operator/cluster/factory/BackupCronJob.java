/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.cluster.factory;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import com.google.common.collect.ImmutableList;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.EnvVarBuilder;
import io.fabric8.kubernetes.api.model.EnvVarSourceBuilder;
import io.fabric8.kubernetes.api.model.HasMetadata;
import io.fabric8.kubernetes.api.model.ObjectFieldSelectorBuilder;
import io.fabric8.kubernetes.api.model.VolumeBuilder;
import io.fabric8.kubernetes.api.model.batch.CronJob;
import io.fabric8.kubernetes.api.model.batch.CronJobBuilder;
import io.fabric8.kubernetes.api.model.batch.JobTemplateSpecBuilder;
import io.fabric8.kubernetes.client.CustomResource;
import io.stackgres.common.ClusterStatefulSetPath;
import io.stackgres.common.LabelFactory;
import io.stackgres.common.StackGresComponent;
import io.stackgres.common.StackGresContext;
import io.stackgres.common.StackgresClusterContainers;
import io.stackgres.common.crd.sgbackup.BackupPhase;
import io.stackgres.common.crd.sgbackup.StackGresBackup;
import io.stackgres.common.crd.sgbackupconfig.StackGresBackupConfig;
import io.stackgres.common.crd.sgbackupconfig.StackGresBackupConfigSpec;
import io.stackgres.common.crd.sgbackupconfig.StackGresBaseBackupConfig;
import io.stackgres.common.crd.sgcluster.StackGresCluster;
import io.stackgres.operator.common.StackGresBackupContext;
import io.stackgres.operator.common.StackGresClusterContext;
import io.stackgres.operator.common.StackGresClusterResourceStreamFactory;
import io.stackgres.operator.common.StackGresPodSecurityContext;
import io.stackgres.operator.patroni.factory.PatroniRole;
import org.jooq.lambda.Seq;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class BackupCronJob implements StackGresClusterResourceStreamFactory {

  private static final Logger BACKUP_LOGGER = LoggerFactory.getLogger("io.stackgres.backup");

  private final ClusterStatefulSetEnvironmentVariables clusterStatefulSetEnvironmentVariables;

  private final LabelFactory<StackGresCluster> labelFactory;

  private final StackGresPodSecurityContext clusterPodSecurityContext;

  @Inject
  public BackupCronJob(
      ClusterStatefulSetEnvironmentVariables clusterStatefulSetEnvironmentVariables,
      LabelFactory<StackGresCluster> labelFactory,
      StackGresPodSecurityContext clusterPodSecurityContext) {
    super();
    this.clusterStatefulSetEnvironmentVariables = clusterStatefulSetEnvironmentVariables;
    this.labelFactory = labelFactory;
    this.clusterPodSecurityContext = clusterPodSecurityContext;
  }

  /**
   * Create a new CronJob based on the StackGresCluster definition.
   */
  @Override
  public Stream<HasMetadata> streamResources(StackGresClusterContext context) {
    return Seq.of(context.getBackupContext())
        .filter(Optional::isPresent)
        .map(Optional::get)
        .map(StackGresBackupContext::getBackupConfig)
        .map(backupConfig -> createCronJob(context, backupConfig));
  }

  private CronJob createCronJob(StackGresClusterContext context,
      StackGresBackupConfig backupConfig) {
    String namespace = context.getCluster().getMetadata().getNamespace();
    String name = context.getCluster().getMetadata().getName();
    final StackGresCluster cluster = context.getCluster();
    Map<String, String> labels = labelFactory.scheduledBackupPodLabels(cluster);
    return new CronJobBuilder()
        .withNewMetadata()
        .withNamespace(namespace)
        .withName(ClusterStatefulSet.backupName(context))
        .withLabels(labels)
        .withOwnerReferences(context.getOwnerReferences())
        .endMetadata()
        .withNewSpec()
        .withConcurrencyPolicy("Allow")
        .withFailedJobsHistoryLimit(10)
        .withStartingDeadlineSeconds(5 * 60L)
        .withSchedule(Optional.of(backupConfig)
            .map(StackGresBackupConfig::getSpec)
            .map(StackGresBackupConfigSpec::getBaseBackups)
            .map(StackGresBaseBackupConfig::getCronSchedule)
            .orElse("0 5 * * *"))
        .withJobTemplate(new JobTemplateSpecBuilder()
            .withNewMetadata()
            .withNamespace(namespace)
            .withName(ClusterStatefulSet.backupName(context))
            .withLabels(labels)
            .endMetadata()
            .withNewSpec()
            .withBackoffLimit(3)
            .withCompletions(1)
            .withParallelism(1)
            .withNewTemplate()
            .withNewMetadata()
            .withNamespace(namespace)
            .withName(ClusterStatefulSet.backupName(context))
            .withLabels(labels)
            .endMetadata()
            .withNewSpec()
            .withSecurityContext(clusterPodSecurityContext.createResource(context))
            .withRestartPolicy("OnFailure")
            .withServiceAccountName(PatroniRole.roleName(context))
            .withContainers(new ContainerBuilder()
                .withName("create-backup")
                .withImage(StackGresComponent.KUBECTL.findLatestImageName())
                .withImagePullPolicy("IfNotPresent")
                .withEnv(ImmutableList.<EnvVar>builder()
                    .addAll(clusterStatefulSetEnvironmentVariables.listResources(
                        context))
                    .add(new EnvVarBuilder()
                            .withName("CLUSTER_NAMESPACE")
                            .withValue(namespace)
                            .build(),
                        new EnvVarBuilder()
                            .withName("CLUSTER_NAME")
                            .withValue(name)
                            .build(),
                        new EnvVarBuilder()
                            .withName("CRONJOB_NAME")
                            .withValue(ClusterStatefulSet.backupName(context))
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_CONFIG_CRD_NAME")
                            .withValue(CustomResource.getCRDName(StackGresBackupConfig.class))
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_CONFIG")
                            .withValue(backupConfig.getMetadata().getName())
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_CRD_KIND")
                            .withValue(HasMetadata.getKind(StackGresBackup.class))
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_CRD_NAME")
                            .withValue(CustomResource.getCRDName(StackGresBackup.class))
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_CRD_APIVERSION")
                            .withValue(HasMetadata.getApiVersion(StackGresBackup.class))
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_PHASE_RUNNING")
                            .withValue(BackupPhase.RUNNING.label())
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_PHASE_COMPLETED")
                            .withValue(BackupPhase.COMPLETED.label())
                            .build(),
                        new EnvVarBuilder()
                            .withName("BACKUP_PHASE_FAILED")
                            .withValue(BackupPhase.FAILED.label())
                            .build(),
                        new EnvVarBuilder()
                            .withName("PATRONI_ROLE_KEY")
                            .withValue(StackGresContext.ROLE_KEY)
                            .build(),
                        new EnvVarBuilder()
                            .withName("PATRONI_PRIMARY_ROLE")
                            .withValue(StackGresContext.PRIMARY_ROLE)
                            .build(),
                        new EnvVarBuilder()
                            .withName("PATRONI_REPLICA_ROLE")
                            .withValue(StackGresContext.REPLICA_ROLE)
                            .build(),
                        new EnvVarBuilder()
                            .withName("SCHEDULED_BACKUP_KEY")
                            .withValue(StackGresContext.SCHEDULED_BACKUP_KEY)
                            .build(),
                        new EnvVarBuilder()
                            .withName("RIGHT_VALUE")
                            .withValue(StackGresContext.RIGHT_VALUE)
                            .build(),
                        new EnvVarBuilder()
                            .withName("PATRONI_CLUSTER_LABELS")
                            .withValue(labelFactory.patroniClusterLabels(cluster)
                                .entrySet()
                                .stream()
                                .map(e -> e.getKey() + "=" + e.getValue())
                                .collect(Collectors.joining(",")))
                            .build(),
                        new EnvVarBuilder()
                            .withName("PATRONI_CONTAINER_NAME")
                            .withValue(StackgresClusterContainers.PATRONI)
                            .build(),
                        new EnvVarBuilder().withName("POD_NAME")
                            .withValueFrom(
                                new EnvVarSourceBuilder()
                                    .withFieldRef(
                                        new ObjectFieldSelectorBuilder()
                                            .withFieldPath("metadata.name")
                                            .build())
                                    .build())
                            .build(),
                        new EnvVarBuilder()
                            .withName("RETAIN")
                            .withValue(Optional.of(backupConfig)
                                .map(StackGresBackupConfig::getSpec)
                                .map(StackGresBackupConfigSpec::getBaseBackups)
                                .map(StackGresBaseBackupConfig::getRetention)
                                .map(String::valueOf)
                                .orElse("5"))
                            .build(),
                        new EnvVarBuilder()
                            .withName("WINDOW")
                            .withValue("3600")
                            .build())
                    .build())
                .withCommand("/bin/bash", "-e" + (BACKUP_LOGGER.isTraceEnabled() ? "x" : ""),
                    ClusterStatefulSetPath.LOCAL_BIN_CREATE_BACKUP_SH_PATH.path())
                .withVolumeMounts(ClusterStatefulSetVolumeConfig.TEMPLATES
                    .volumeMount(context,
                        volumeMountBuilder -> volumeMountBuilder
                        .withSubPath(
                            ClusterStatefulSetPath.LOCAL_BIN_CREATE_BACKUP_SH_PATH.filename())
                        .withMountPath(
                            ClusterStatefulSetPath.LOCAL_BIN_CREATE_BACKUP_SH_PATH.path())
                        .withReadOnly(true)),
                    ClusterStatefulSetVolumeConfig.TEMPLATES
                    .volumeMount(context,
                        volumeMountBuilder -> volumeMountBuilder
                        .withSubPath(
                            ClusterStatefulSetPath.LOCAL_BIN_SHELL_UTILS_PATH.filename())
                        .withMountPath(
                            ClusterStatefulSetPath.LOCAL_BIN_SHELL_UTILS_PATH.path())
                        .withReadOnly(true)))
                .build())
            .withVolumes(new VolumeBuilder(ClusterStatefulSetVolumeConfig.TEMPLATES
                .volume(context))
                .editConfigMap()
                .withDefaultMode(0555) // NOPMD
                .endConfigMap()
                .build())
            .endSpec()
            .endTemplate()
            .endSpec()
            .build())
        .endSpec()
        .build();
  }

}
