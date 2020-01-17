/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.resource;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import io.stackgres.operator.app.KubernetesClientFactory;
import io.stackgres.operator.common.ArcUtil;
import io.stackgres.operator.customresource.sgbackupconfig.StackGresBackupConfig;
import io.stackgres.operator.customresource.sgbackupconfig.StackGresBackupConfigDefinition;
import io.stackgres.operator.customresource.sgbackupconfig.StackGresBackupConfigDoneable;
import io.stackgres.operator.customresource.sgbackupconfig.StackGresBackupConfigList;

@ApplicationScoped
public class BackupConfigScanner
    extends AbstractKubernetesCustomResourceScanner<StackGresBackupConfig,
    StackGresBackupConfigList, StackGresBackupConfigDoneable> {

  /**
   * Create a {@code BackupConfigScanner} instance.
   */
  @Inject
  public BackupConfigScanner(KubernetesClientFactory clientFactory) {
    super(clientFactory, StackGresBackupConfigDefinition.NAME,
        StackGresBackupConfig.class, StackGresBackupConfigList.class,
        StackGresBackupConfigDoneable.class);
  }

  public BackupConfigScanner() {
    super(null, null, null, null, null);
    ArcUtil.checkPublicNoArgsConstructorIsCalledFromArc();
  }

}