/*
 * Copyright (C) 2019 OnGres, Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

package io.stackgres.apiweb.distributedlogs.dto.storages;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.quarkus.runtime.annotations.RegisterForReflection;
import io.stackgres.apiweb.distributedlogs.dto.SecretKeySelector;

@JsonDeserialize
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
@RegisterForReflection
public class AwsSecretKeySelector {

  @JsonProperty("accessKeyId")
  private SecretKeySelector accessKeyId;

  @JsonProperty("secretAccessKey")
  private SecretKeySelector secretAccessKey;

  public SecretKeySelector getAccessKeyId() {
    return accessKeyId;
  }

  public void setAccessKeyId(SecretKeySelector accessKeyId) {
    this.accessKeyId = accessKeyId;
  }

  public SecretKeySelector getSecretAccessKey() {
    return secretAccessKey;
  }

  public void setSecretAccessKey(SecretKeySelector secretAccessKey) {
    this.secretAccessKey = secretAccessKey;
  }
}