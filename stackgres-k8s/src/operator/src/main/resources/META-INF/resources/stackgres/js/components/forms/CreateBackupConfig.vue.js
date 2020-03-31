var CreateBackupConfig = Vue.component("create-backup-config", {
    template: `
        <form id="create-backup-config">
            <header>
                <ul class="breadcrumbs">
                    <li class="namespace">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20.026" height="27"><g fill="#00adb5"><path d="M1.513.9l-1.5 13a.972.972 0 001 1.1h18a.972.972 0 001-1.1l-1.5-13a1.063 1.063 0 00-1-.9h-15a1.063 1.063 0 00-1 .9zm.6 11.5l.9-8c0-.2.3-.4.5-.4h12.9a.458.458 0 01.5.4l.9 8a.56.56 0 01-.5.6h-14.7a.56.56 0 01-.5-.6zM1.113 17.9a1.063 1.063 0 011-.9h15.8a1.063 1.063 0 011 .9.972.972 0 01-1 1.1h-15.8a1.028 1.028 0 01-1-1.1zM3.113 23h13.8a.972.972 0 001-1.1 1.063 1.063 0 00-1-.9h-13.8a1.063 1.063 0 00-1 .9 1.028 1.028 0 001 1.1zM3.113 25.9a1.063 1.063 0 011-.9h11.8a1.063 1.063 0 011 .9.972.972 0 01-1 1.1h-11.8a1.028 1.028 0 01-1-1.1z"/></g></svg>
                        <router-link :to="'/overview/'+currentNamespace" title="Namespace Overview">{{ currentNamespace }}</router-link>
                    </li>
                    <li class="action">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.1 20"><path d="M15.889 13.75a2.277 2.277 0 011.263.829 2.394 2.394 0 01.448 1.47 2.27 2.27 0 01-.86 1.885 3.721 3.721 0 01-2.375.685h-3.449a.837.837 0 01-.6-.213.8.8 0 01-.22-.6v-7.795a.8.8 0 01.22-.6.835.835 0 01.609-.214h3.306a3.679 3.679 0 012.306.648 2.165 2.165 0 01.836 1.815 2.159 2.159 0 01-.395 1.3 2.254 2.254 0 01-1.089.79zm-4.118-.585h2.179q1.779 0 1.778-1.323a1.143 1.143 0 00-.441-.989 2.267 2.267 0 00-1.337-.321h-2.179zm2.407 4.118a2.219 2.219 0 001.363-.335 1.242 1.242 0 00.428-1.042 1.271 1.271 0 00-.435-1.056 2.155 2.155 0 00-1.356-.348h-2.407v2.781zm8.929 1.457a3.991 3.991 0 01-2.941-1 3.968 3.968 0 01-1-2.927V9.984a.854.854 0 01.227-.622.925.925 0 011.23 0 .854.854 0 01.227.622V14.9a2.623 2.623 0 00.573 1.838 2.18 2.18 0 001.684.622 2.153 2.153 0 001.671-.628 2.624 2.624 0 00.573-1.832V9.984a.85.85 0 01.228-.622.924.924 0 011.229 0 .85.85 0 01.228.622v4.826a3.969 3.969 0 01-1 2.92 3.95 3.95 0 01-2.929 1.01zM.955 4.762h10.5a.953.953 0 100-1.9H.955a.953.953 0 100 1.9zM14.8 7.619a.954.954 0 00.955-.952V4.762h4.3a.953.953 0 100-1.9h-4.3V.952a.955.955 0 00-1.909 0v5.715a.953.953 0 00.954.952zM.955 10.952h4.3v1.9a.955.955 0 001.909 0V7.143a.955.955 0 00-1.909 0v1.9h-4.3a.953.953 0 100 1.9zm6.681 4.286H.955a.953.953 0 100 1.905h6.681a.953.953 0 100-1.905z"></path></svg>
                        {{ $route.params.action }} backup configuration
                    </li>
                    <li v-if="editMode">
                        {{ $route.params.name }}
                    </li>
                </ul>
            </header>
                    
            <div class="form">
                <div class="header">
                    <h2>Backup Configuration Details</h2>
                    <label for="advancedMode" :class="(advancedMode) ? 'active' : ''">
                        <input v-model="advancedMode" type="checkbox" id="advancedMode" name="advancedMode" />
                        <span>Advanced</span>
                    </label>
                </div>
                
                <label for="backupConfigName">Configuration Name <span class="req">*</span></label>
                <input v-model="backupConfigName" :disabled="(editMode)" required data-dield="metadata.name">

                <fieldset class="cron row-20" data-field="spec.fullSchedule">
                    <div class="header">
                        <h3>Base Backup Schedule <span class="req">*</span></h3>
                    </div>                    
                    
                    <div class="col">
                        <label for="backupConfigFullScheduleMin">Minute <span class="req">*</span></label>
                        <input v-model="backupConfigFullScheduleMin" required>
                    </div>

                    <div class="col">
                        <label for="backupConfigFullScheduleHour">Hour <span class="req">*</span></label>
                        <input v-model="backupConfigFullScheduleHour" required>
                    </div>

                    <div class="col">
                        <label for="backupConfigFullScheduleDOM">Day of Month <span class="req">*</span></label>
                        <input v-model="backupConfigFullScheduleDOM" required>
                    </div>

                    <div class="col">
                        <label for="backupConfigFullScheduleMonth">Month <span class="req">*</span></label>
                        <input v-model="backupConfigFullScheduleMonth" required>
                    </div>

                    <div class="col">
                        <label for="backupConfigFullScheduleDOW">Day of Week <span class="req">*</span></label>
                        <input v-model="backupConfigFullScheduleDOW" required>
                    </div>
                </fieldset>

                <!-- <template v-if="advancedMode">
                    <label for="backupConfigFullWindow">Full Window</label>
                    <input v-model="backupConfigFullWindow" value="" required data-field="spec.fullWindow">
                </template> -->

                <label for="backupConfigRetention">Retention Window (max. number of base backups) <span class="req">*</span></label>
                <input v-model="backupConfigRetention" value="" required data-field="spec.retention">

                <template v-if="advancedMode">
                    <label for="backupConfigCompressionMethod">Compression Method</label>
                    <select v-model="backupConfigCompressionMethod" data-field="spec.compressionMethod">
                        <option disabled value="">Select a method</option>
                        <option value="lz4">LZ4</option>
                        <option value="lzma">LZMA</option>
                        <option value="brotli">Brotli</option>
                    </select>
                </template>

                <template v-if="advancedMode">
                    <div class="unit-select">
                        <label for="backupConfigTarSizeThreshold">Tar Size Threshold</label>  
                        <input v-model="backupConfigTarSizeThreshold" class="size" value="" data-field="spec.tarSizeThreshold">
                        <select v-model="backupConfigTarSizeThresholdUnit" class="unit" data-field="spec.tarSizeThreshold">
                            <option disabled value="">Select Unit</option>
                            <option value="1024">KiB</option>
                            <option value="1048576">MiB</option>
                            <option value="1073741824">GiB</option>
                            <option value="1099511627776">TiB</option>
                            <option value="1125899906842624">PiB</option>
                            <option value="1152921504606846976">EiB</option>
                            <option value="1180591620717411303424">ZiB</option>
                            <option value="1208925819614629174706176">YiB</option>        
                        </select>
                    </div>
                
                    <label for="backupConfigUploadDiskConcurrency">Upload Disk Concurrency</label>
                    <input v-model="backupConfigUploadDiskConcurrency" value="" data-field="spec.uploadDiskConcurrency">
                </template>

                <label for="backupConfigStorageType">Storage Type <span class="req">*</span></label>
                <select v-model="backupConfigStorageType" :disabled="(editMode)" data-field="spec.storage.type">
                    <option disabled value="">Select Storage Type</option>
                    <option value="s3">Amazon S3</option>
                    <option value="s3compatible">Amazon S3 - API Compatible</option>
                    <option value="gcs">Google Cloud Storage</option>
                    <option value="azureblob">Azure Blob Storage</option>
                </select>

                <fieldset class="fieldset" :disabled="(editMode)" required v-if="backupConfigStorageType.length">
                    <div class="header">
                        <h3 v-if="backupConfigStorageType === 's3'">
                            Amazon S3 Configuration
                        </h3>
                        <h3 v-else-if="backupConfigStorageType === 's3compatible'">
                            AS3 Compatible Configuration
                        </h3>
                        <h3 v-else-if="backupConfigStorageType === 'gcs'">
                            Google Cloud Storage Configuration
                        </h3>
                        <h3 v-else-if="backupConfigStorageType === 'azureblob'">
                            Microsoft Azure Configuration
                        </h3>

                        <label for="advancedModeStorage" :class="(advancedModeStorage) ? 'active' : ''">
                            <input v-model="advancedModeStorage" type="checkbox" id="advancedModeStorage" name="advancedModeStorage" />
                            <span>Advanced</span>
                        </label>
                    </div>       

                    <label for="backupBucket">Bucket <span class="req">*</span></label>
                    <input v-model="backupBucket">

                    <template v-if="advancedModeStorage">
                        <label for="backupPath">Path</label>
                        <input v-model="backupPath">
                    </template>

                    <template v-if="backupConfigStorageType === 's3compatible'">
                        <label for="backupS3CEndpoint">Endpoint <span class="req">*</span></label>
                        <input v-model="backupS3CEndpoint">
                    </template>

                    <template v-if="( (backupConfigStorageType === 's3') || (backupConfigStorageType === 's3compatible') )">
                        
                        <template v-if="advancedModeStorage">
                            <label for="backupS3Region">Region</label>
                            <input v-model="backupS3Region">
                        </template>

                        <label for="backupS3AccessKey">API Key <span class="req">*</span></label>
                        <input v-model="backupS3AccessKey" required>

                        <label for="backupS3SecretKey">API Secret <span class="req">*</span></label>
                        <input v-model="backupS3SecretKey" required>

                        <template v-if="advancedModeStorage && (backupConfigStorageType === 's3compatible')">
                            <label>Bucket URL Force Path Style</label>
                            <label for="backupS3CForcePathStyle" class="switch">
                                Force Path Style
                                <input type="checkbox" id="backupS3CForcePathStyle" v-model="backupS3CForcePathStyle" data-switch="OFF">
                            </label>
                        </template>

                        <template v-if="advancedModeStorage">
                            <label for="backupS3StorageClass">Storage Class</label>
                            <select v-model="backupS3StorageClass">
                                <option disabled value="">Select Storage Class...</option>
                                <option value="STANDARD">Standard</option>
                                <option value="STANDARD_IA">Infrequent Access</option>
                                <option value="REDUCED_REDUNDANCY">Reduced Redundancy</option>
                            </select>
                        </template>

                    </template>

                    <template v-if="backupConfigStorageType === 'gcs'">
                        <label for="backupGCSServiceAccountJsonKey">Service Account JSON <span class="req">*</span></label>
                        <input type="file" @change="uploadJSON" :required="!editMode" :class="editMode ? 'hide' : ''">
                        <input type="textarea" v-model="backupGCSServiceAccountJsonKey" :class="!editMode ? 'hide' : ''"> 
                    </template>

                    <template v-if="backupConfigStorageType === 'azureblob'">
                        <label for="backupAzureAccount">Account Name <span class="req">*</span></label>
                        <input v-model="backupAzureAccount" required>

                        <label for="backupAzureAccessKey">Account Access Key <span class="req">*</span></label>
                        <input v-model="backupAzureAccessKey" required>
                    </template>

                </fieldset>

                <template v-if="editMode">
                    <button @click="createBackupConfig">Update Configuration</button>
                </template>
                <template v-else>
                    <button @click="createBackupConfig">Create Configuration</button>
                </template>

                <button @click="cancel" class="border">Cancel</button>
            </div>
        </form>`,
	data: function() {
        
        if (vm.$route.params.action == 'create') {
            
            return {
                editMode: false,
                advancedMode: false,
                advancedModeStorage: false,
                backupConfigName: vm.$route.params.name,
                backupConfigNamespace: store.state.currentNamespace,
                backupConfigCompressionMethod: 'lz4',
                backupConfigFullSchedule: '*/2 * * * *',
                backupConfigFullScheduleMin: '*/2',
                backupConfigFullScheduleHour: '*',
                backupConfigFullScheduleDOM: '*',
                backupConfigFullScheduleMonth: '*',
                backupConfigFullScheduleDOW: '*',
                //backupConfigFullWindow: 1,
                backupConfigRetention: 5,
                backupConfigTarSizeThreshold: 1,
                backupConfigTarSizeThresholdUnit: 1073741824,
                backupConfigUploadDiskConcurrency: 1,
                backupConfigStorageType: '',
                backupBucket: '',
                backupPath: '',
                backupS3CEndpoint: '',
                backupS3Region: '',
                backupS3AccessKey: '',
                backupS3SecretKey: '',
                backupS3CForcePathStyle: false,
                backupS3StorageClass: '',
                backupGCSServiceAccountJsonKey: '',
                backupAzureAccount: '',
                backupAzureAccessKey: '',
            }
        } else if (vm.$route.params.action == 'edit') {
            
            let config = {};
            
            store.state.backupConfig.forEach(function( conf ){
                if( (conf.data.metadata.name === vm.$route.params.name) && (conf.data.metadata.namespace === vm.$route.params.namespace) ) {
                    config = conf;
                    return false;
                }
            });

            
            let tresholdSize = formatBytes(config.data.spec.tarSizeThreshold);
            let tresholdUnit = '';            
            let unitSizes = {
                "Ki": 1024, 
                "Mi": 1048576,
                "Gi": 1073741824,
                "Ti": 1099511627776,
                "Pi": 1125899906842624,
                "Ei": 1152921504606846976,
                "Zi": 1180591620717411303424,
                "Yi": 1208925819614629174706176
            };
            
            $.each( unitSizes, function( index, value ){
                if( tresholdSize.match(/[a-zA-Z]+/g)[0] === index ) {
                    tresholdUnit = value;
                    return false;
                }
            });
            
            // console.log(tresholdSize);
            // console.log(tresholdSize.match(/[a-zA-Z]+/g));
            // console.log(tresholdSize.match(/[a-zA-Z]+/g)[0]);

            // Cron to Human
            let cron = config.data.spec.fullSchedule.split(" ");

            return {
                editMode: true,
                advancedMode: false,
                advancedModeStorage: false,
                backupConfigName: vm.$route.params.name,
                backupConfigNamespace: store.state.currentNamespace,
                backupConfigCompressionMethod: config.data.spec.compressionMethod,
                backupConfigFullSchedule: config.data.spec.fullSchedule,
                backupConfigFullScheduleMin: cron[0],
                backupConfigFullScheduleHour: cron[1],
                backupConfigFullScheduleDOM: cron[2],
                backupConfigFullScheduleMonth: cron[3],
                backupConfigFullScheduleDOW: cron[4],
                //backupConfigFullWindow: config.data.spec.fullWindow,
                backupConfigRetention: config.data.spec.retention,
                backupConfigTarSizeThreshold: tresholdSize.match(/\d+/g),
                backupConfigTarSizeThresholdUnit: tresholdUnit,
                backupConfigUploadDiskConcurrency: config.data.spec.uploadDiskConcurrency,
                backupConfigStorageType: config.data.spec.storage.type,
                backupBucket: config.data.spec.storage[config.data.spec.storage.type].bucket,
                backupPath: config.data.spec.storage[config.data.spec.storage.type].path,
                backupS3CEndpoint: (config.data.spec.storage.type === 's3compatible') ? config.data.spec.storage.s3compatible.endpoint : '',
                backupS3Region: ( (config.data.spec.storage.type.startsWith('s3')) && (typeof config.data.spec.storage[config.data.spec.storage.type].region !== 'undefined') ) ? config.data.spec.storage[config.data.spec.storage.type].region : '',
                backupS3AccessKey: (config.data.spec.storage.type.startsWith('s3')) ? config.data.spec.storage[config.data.spec.storage.type].credentials.accessKey : '',
                backupS3SecretKey: (config.data.spec.storage.type.startsWith('s3')) ? config.data.spec.storage[config.data.spec.storage.type].credentials.secretKey : '',
                backupS3CForcePathStyle: ( (config.data.spec.storage.type === 's3compatible') && (typeof config.data.spec.storage.s3compatible.forcePathStyle !== 'undefined') ) ? config.data.spec.storage.s3compatible.forcePathStyle : '',
                backupS3StorageClass: (config.data.spec.storage.type.startsWith('s3')) ? config.data.spec.storage[config.data.spec.storage.type].storageClass : '',
                backupGCSServiceAccountJsonKey: (config.data.spec.storage.type === 'gcs') ? config.data.spec.storage.gcs.credentials.serviceAccountJsonKey : '',
                backupAzureAccount: (config.data.spec.storage.type === 'azureblob') ? config.data.spec.storage.azureblob.credentials.account : '',
                backupAzureAccessKey: (config.data.spec.storage.type === 'azureblob') ? config.data.spec.storage.azureblob.credentials.accessKey : '',
                /*
                backupS3Prefix: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.prefix : '',
                backupS3AccessKeyName: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.accessKey.name : '',
                backupS3AccessKey: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.accessKey.key : '',
                backupS3SecretKeyName: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.secretKey.name : '',
                backupS3SecretKey: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.secretKey.key : '',
                backupS3Region: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.region : '',
                backupS3Endpoint: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.endpoint : '',
                backupS3CForcePathStyle: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.credentials.forcePathStyle : '',
                backupS3StorageClass: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.storageClass : '',
                backupS3sse: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.sse : '',
                backupS3sseKmsId: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.sseKmsId : '',
                backupS3cseKmsId: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.cseKmsId : '',
                backupS3cseKmsRegion: ( config.data.spec.storage.type === 's3' ) ? config.data.spec.storage.s3.cseKmsRegion : '',
                backupGCSPrefix:  ( config.data.spec.storage.type === 'gcs' ) ? config.data.spec.storage.gcs.prefix : '',
                backupGCSKeyName: ( config.data.spec.storage.type === 'gcs' ) ? config.data.spec.storage.gcs.credentials.serviceAccountJsonKey.name : '',
                backupGCSKey: ( config.data.spec.storage.type === 'gcs' ) ? config.data.spec.storage.gcs.credentials.serviceAccountJsonKey.key : '',
                backupAzurePrefix: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.prefix : '',
                backupAzureAccountName: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.credentials.account.name : '',
                backupAzureAccountKey: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.credentials.account.key : '',
                backupAzureAccessKeyName: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.credentials.accessKey.name : '',
                backupAzureAccessKey: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.credentials.accessKey.key : '',
                backupAzureBufferSize: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.bufferSize : '',
                backupAzureMaxBuffers: ( config.data.spec.storage.type === 'azureblob' ) ? config.data.spec.storage.azureblob.maxBuffers : '', */
            }
        }
	},
	computed: {
        allNamespaces () {
            return store.state.allNamespaces
        },

        currentNamespace() {
            return store.state.currentNamespace
        }
    },
    methods: {

        
        createBackupConfig: function(e) {
            //e.preventDefault();

            let isValid = true;
            
            $('input:required, select:required').each(function() {
                if ($(this).val() === '') {
                    isValid = false;
                    return false;
                }
                    
            });

            if(isValid) {
                let storage = {};

                switch(this.backupConfigStorageType) {
                    
                    case 's3':
                        storage['s3'] = {
                            "bucket": this.backupBucket,
                            "credentials": {
                                "accessKey": this.backupS3AccessKey,
                                "secretKey": this.backupS3SecretKey
                            },
                            ...( ((typeof this.backupPath !== 'undefined') && this.backupPath.length ) && ( {"path": this.backupPath }) ),
                            ...( ((typeof this.backupS3Region !== 'undefined') && this.backupS3Region.length ) && ( {"region": this.backupS3Region }) ),
                            ...( ((typeof this.backupS3StorageClass !== 'undefined') && this.backupS3StorageClass.length ) && ( {"storageClass": this.backupS3StorageClass }) ),
                        };
                        storage['type'] = 's3';
                        break;
                    
                    case 's3compatible':
                        storage['s3compatible'] = {
                            "bucket": this.backupBucket,
                            "endpoint": this.backupS3CEndpoint,
                            "credentials": {
                                "accessKey": this.backupS3AccessKey,
                                "secretKey": this.backupS3SecretKey
                            },
                            ...( ((typeof this.backupPath !== 'undefined') && this.backupPath.length ) && ( {"path": this.backupPath }) ),
                            ...( ((typeof this.backupS3Region !== 'undefined') && this.backupS3Region.length ) && ( {"region": this.backupS3Region }) ),
                            ...( ((typeof this.backupS3StorageClass !== 'undefined') && this.backupS3StorageClass.length ) && ( {"storageClass": this.backupS3StorageClass }) ),
                            "forcePathStyle": this.backupS3CForcePathStyle
                        };
                        storage['type'] = 's3compatible';
                        break;

                    case 'gcs':
                        storage['gcs'] = {
                            "bucket": this.backupBucket,
                            "credentials": {
                                "serviceAccountJsonKey": this.backupGCSServiceAccountJsonKey
                            },
                            ...( ((typeof this.backupPath !== 'undefined') && this.backupPath.length ) && ( {"path": this.backupPath }) ),
                        }
                        storage['type'] = 'gcs';
                        break;

                    case 'azureblob':
                        storage['azureblob'] = {
                            "bucket": this.backupBucket,
                            ...( ((typeof this.backupPath !== 'undefined') && this.backupPath.length ) && ( {"path": this.backupPath }) ),
                            "credentials": {
                                "account": this.backupAzureAccount,
                                "accessKey": this.backupAzureAccessKey
                            }
                        }
                        storage['type'] = 'azureblob';
                        break;

                }

                let config = { 
                    "metadata": {
                        "name": this.backupConfigName,
                        "namespace": this.backupConfigNamespace
                    },
                    "spec": {
                        "compressionMethod": this.backupConfigCompressionMethod,
                        "fullSchedule": this.backupConfigFullScheduleMin+' '+this.backupConfigFullScheduleHour+' '+this.backupConfigFullScheduleDOM+' '+this.backupConfigFullScheduleMonth+' '+this.backupConfigFullScheduleDOW,
                        //"fullWindow": this.backupConfigFullWindow,
                        "retention": this.backupConfigRetention,
                        "tarSizeThreshold": this.backupConfigTarSizeThreshold * this.backupConfigTarSizeThresholdUnit,
                        "storage": storage
                    }
                }

                console.log(config);

                if(this.editMode) {
                    
                    const res = axios
                    .put(
                        apiURL+'sgbackupconfig/', 
                        config 
                    )
                    .then(function (response) {
                        console.log("GOOD");
                        notify('Backup configuration <strong>"'+config.metadata.name+'"</strong> updated successfully', 'message','backupConfig');

                        vm.fetchAPI();
                        router.push('/configurations/backup/'+config.metadata.namespace+'/'+config.metadata.name);
                    })
                    .catch(function (error) {
                        console.log(error.response);
                        notify(error.response.data,'error','backupConfig');
                    });

                } else {
                    const res = axios
                    .post(
                        apiURL+'sgbackupconfig/', 
                        config 
                    )
                    .then(function (response) {
                        console.log("GOOD");
                        notify('Backup configuration <strong>"'+config.metadata.name+'"</strong> created successfully', 'message','backupConfig');

                        vm.fetchAPI();
                        router.push('/configurations/backup/'+config.metadata.namespace+'/'+config.metadata.name);
                        

                        /* store.commit('updateBackupConfig', { 
                            name: config.metadata.name,
                            data: config
                        }); */

                        setTimeout(function(){
                            $(".backupConfig").val(config.metadata.name).change().focus();
                            hideFields('.backup-config');
                        },1000);
                    })
                    .catch(function (error) {
                        console.log(error.response);
                        notify(error.response.data,'error','backupConfig');
                    });
                }

            }

        },

        cancel: function() {
            router.push('/configurations/backup/'+store.state.currentNamespace);
        },

        showFields: function( fields ) {
            $(fields).slideDown();
        },

        hideFields: function( fields ) {
            $(fields).slideUp();
        },
        
        uploadJSON: function() {

        }

    }
})