/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.operator.mutation;

public interface MutationUtil {

  String MUTATION_PATH = "/stackgres/mutation";
  String CLUSTER_MUTATION_PATH = MUTATION_PATH + "/sgcluster";
  String PGCONFIG_MUTATION_PATH = MUTATION_PATH + "/sgpgconfig";
  String CONNPOOLCONFIG_MUTATION_PATH =  MUTATION_PATH + "/sgconnectionpoolingconfig";
  String BACKUPCONFIG_MUTATION_PATH = MUTATION_PATH + "/sgbackupconfig";
  String BACKUP_MUTATION_PATH = MUTATION_PATH + "/sgbackup";
  String PROFILE_MUTATION_PATH = MUTATION_PATH + "/sgprofile";
  String RESTORECONFIG_MUTATION_PATH = MUTATION_PATH + "/sgrestoreconfig";

}