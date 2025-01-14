<template>
	<div id="cluster-status" v-if="loggedIn && isReady && !notFound">
		<template v-for="cluster in clusters" v-if="(cluster.name == $route.params.name) && (cluster.data.metadata.namespace == $route.params.namespace)">
			<header>
				<ul class="breadcrumbs">
					<li class="namespace">
						<svg xmlns="http://www.w3.org/2000/svg" width="20.026" height="27"><g fill="#00adb5"><path d="M1.513.9l-1.5 13a.972.972 0 001 1.1h18a.972.972 0 001-1.1l-1.5-13a1.063 1.063 0 00-1-.9h-15a1.063 1.063 0 00-1 .9zm.6 11.5l.9-8c0-.2.3-.4.5-.4h12.9a.458.458 0 01.5.4l.9 8a.56.56 0 01-.5.6h-14.7a.56.56 0 01-.5-.6zM1.113 17.9a1.063 1.063 0 011-.9h15.8a1.063 1.063 0 011 .9.972.972 0 01-1 1.1h-15.8a1.028 1.028 0 01-1-1.1zM3.113 23h13.8a.972.972 0 001-1.1 1.063 1.063 0 00-1-.9h-13.8a1.063 1.063 0 00-1 .9 1.028 1.028 0 001 1.1zM3.113 25.9a1.063 1.063 0 011-.9h11.8a1.063 1.063 0 011 .9.972.972 0 01-1 1.1h-11.8a1.028 1.028 0 01-1-1.1z"/></g></svg>
						<router-link :to="'/overview/'+$route.params.namespace" title="Namespace Overview">{{ $route.params.namespace }}</router-link>
					</li>
					<li>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 0C4.9 0 .9 2.218.9 5.05v11.49C.9 19.272 6.621 20 10 20s9.1-.728 9.1-3.46V5.05C19.1 2.218 15.1 0 10 0zm7.1 11.907c0 1.444-2.917 3.052-7.1 3.052s-7.1-1.608-7.1-3.052v-.375a12.883 12.883 0 007.1 1.823 12.891 12.891 0 007.1-1.824zm0-3.6c0 1.443-2.917 3.052-7.1 3.052s-7.1-1.61-7.1-3.053v-.068A12.806 12.806 0 0010 10.1a12.794 12.794 0 007.1-1.862zM10 8.1c-4.185 0-7.1-1.607-7.1-3.05S5.815 2 10 2s7.1 1.608 7.1 3.051S14.185 8.1 10 8.1zm-7.1 8.44v-1.407a12.89 12.89 0 007.1 1.823 12.874 12.874 0 007.106-1.827l.006 1.345C16.956 16.894 14.531 18 10 18c-4.822 0-6.99-1.191-7.1-1.46z"/></svg>
						<router-link :to="'/overview/'+$route.params.namespace" title="Namespace Overview">SGClusters</router-link>
					</li>
					<li>
						<router-link :to="'/cluster/status/'+$route.params.namespace+'/'+$route.params.name" title="Status">{{ $route.params.name }}</router-link>
					</li>
					<li>
						Status
					</li>
				</ul>

				<div class="actions">
				<a class="documentation" href="https://stackgres.io/doc/latest/reference/crd/sgcluster/" target="_blank" title="SGCluster Documentation">SGCluster Documentation</a>
					<div>
						<a v-if="iCan('create','sgclusters',$route.params.namespace)" class="cloneCRD" @click="cloneCRD('SGCluster', $route.params.namespace, $route.params.name)">Clone Cluster Configuration</a>
						<router-link v-if="iCan('patch','sgclusters',$route.params.namespace)" :to="'/crd/edit/cluster/'+$route.params.namespace+'/'+$route.params.name">Edit Cluster</router-link>
						<a v-if="iCan('delete','sgclusters',$route.params.namespace)" v-on:click="deleteCRD('sgcluster', $route.params.namespace, $route.params.name, '/overview/'+$route.params.namespace)" :class="'/overview/'+$route.params.namespace">Delete Cluster</a>
					</div>
				</div>

				<ul class="tabs">
					<li>
						<router-link :to="'/cluster/status/'+$route.params.namespace+'/'+$route.params.name" title="Status" class="status">Status</router-link>
					</li>
					<li>
						<router-link :to="'/cluster/configuration/'+$route.params.namespace+'/'+$route.params.name" title="Configuration" class="info">Configuration</router-link>
					</li>
					<li v-if="iCan('list','sgbackups',$route.params.namespace)">
						<router-link :to="'/cluster/backups/'+$route.params.namespace+'/'+$route.params.name" title="Backups" class="backups">Backups</router-link>
					</li>
					<li v-if="iCan('list','sgdistributedlogs',$route.params.namespace) && cluster.data.spec.hasOwnProperty('distributedLogs')">
						<router-link :to="'/cluster/logs/'+$route.params.namespace+'/'+$route.params.name" title="Distributed Logs" class="logs">Logs</router-link>
					</li>
					<li v-if="cluster.data.grafanaEmbedded">
						<router-link id="grafana-btn" :to="'/cluster/monitor/'+$route.params.namespace+'/'+$route.params.name" title="Grafana Dashboard" class="grafana">Monitoring</router-link>
					</li>
				</ul>
			</header>
			
			<div class="content" v-if="hasProp(cluster, 'status.pods') && cluster.status.pods.length">
				<h2>
					Cluster
					<template v-for="condition in cluster.data.status.conditions" v-if="( (condition.type == 'PendingRestart') && (condition.status == 'True') )">
						<span class="helpTooltip alert" data-tooltip="A restart operation is pending for this cluster"></span>
					</template>
				</h2>
				<table class="clusterInfo">
					<thead>
						<th>
							Total CPU 
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.cpuRequested').slice(0, -2) + ' (' + (cluster.status.hasOwnProperty('cpuPsiAvg60') ? getTooltip('sgcluster.pods.cpuPsiAvg60') : getTooltip('sgcluster.pods.averageLoad1m')) + ')'"></span>
						</th>
						<th>
							Total Memory
							<span class="helpTooltip" :data-tooltip="cluster.status.hasOwnProperty('memoryPsiAvg60') ? getTooltip('sgcluster.pods.memoryPsiAvg60') : getTooltip('sgcluster.pods.memoryRequested')"></span>
						</th>
						<th>
							Primary Node Disk
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.diskUsed').slice(0, -2) + ' / ' + getTooltip('sgcluster.spec.pods.persistentVolume.size') + (cluster.status.hasOwnProperty('diskPsiAvg60') ? ' (' + getTooltip('sgcluster.pods.diskPsiAvg60') + ')' : '')"></span>
						</th>
						<th>
							Total Allocated Disk
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterstats.diskRequested')"></span>
						</th>
						<th>
							Instances
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.podsReady').slice(0, -2) + ' / ' + getTooltip('sgcluster.spec.instances')"></span>
						</th>
					</thead>
					<tbody>
						<tr>
							<td>
								{{ cluster.status.cpuRequested }} 
								<template v-if="cluster.status.podsReady">
									(avg. load {{ cluster.status.hasOwnProperty('cpuPsiAvg60') ? cluster.status.cpuPsiAvg60 : cluster.status.averageLoad1m }})
								</template>
							</td>
							<td>
								{{ cluster.status.hasOwnProperty('memoryPsiAvg60') ? cluster.status.memoryPsiAvg60 : cluster.status.memoryRequested}}
							</td>
							<td class="flex-center">
								<template v-if="cluster.status.hasOwnProperty('pods') && (typeof (cluster.status.pods.find(p => (p.role == 'primary'))) !== 'undefined')">
									<template v-for="pod in cluster.status.pods" v-if="pod.role == 'primary'">
											<div class="donut">
											<svg class="loader" xmlns="http://www.w3.org/2000/svg" version="1.1">
												<circle cx="12.5" cy="12.5" r="10" stroke-width="5" fill="none" :stroke-dasharray="diskUsed+',63'" />
											</svg>
											<svg class="background" xmlns="http://www.w3.org/2000/svg" version="1.1">
												<circle cx="12.5" cy="12.5" r="10" stroke-width="5" fill="none" />
											</svg>
										</div>
										{{ pod.diskUsed }} / {{ pod.diskRequested }}
									</template>
								</template>
								<template v-else>
									-
								</template>
							</td>
							<td>{{ cluster.status.hasOwnProperty('diskRequested') ? cluster.status.diskRequested : '-' }}</td>
							<td>{{ cluster.data.podsReady }} / {{ cluster.data.spec.instances }}</td>
						</tr>
					</tbody>
				</table>

				<h2>Pods</h2>
				<table class="podStatus">
					<thead>
						<th>
							Pod Name
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.name')"></span>
						</th>
						<th>
							Role
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.role')"></span>
						</th>
						<th>
							Status
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.status')"></span>
						</th>
						<th>
							CPU
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.cpuRequested').slice(0, -2) + ' (' + (cluster.status.hasOwnProperty('cpuPsiAvg60') ? getTooltip('sgcluster.pods.cpuPsiAvg60') : getTooltip('sgcluster.pods.averageLoad1m')) + ')'"></span>
						</th>
						<th>
							Memory
							<span class="helpTooltip" :data-tooltip="cluster.status.hasOwnProperty('memoryPsiAvg60') ? getTooltip('sgcluster.pods.memoryPsiAvg60') : getTooltip('sgcluster.pods.memoryRequested')"></span>
						</th>
						<th>
							Disk
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.diskUsed').slice(0, -2) + ' / ' + getTooltip('sgcluster.pods.diskRequested') + (cluster.status.hasOwnProperty('diskPsiAvg60') ? ' (' + getTooltip('sgcluster.pods.diskPsiAvg60') + ')' : '')"></span>
						</th>
						<th>
							Containers
							<span class="helpTooltip" :data-tooltip="getTooltip('sgcluster.pods.containersReady').slice(0, -2) + ' / ' + getTooltip('sgcluster.pods.containers')"></span>
						</th>
					</thead>
					<tbody>
						<tr v-for="pod in cluster.status.pods">
							<td>{{ pod.name }}</td>
							<td class="label" :class="pod.role"><span>{{ pod.role }}</span></td>
							<td class="label" :class="pod.status"><span>{{ pod.status }}</span></td>
							<td>
								{{ pod.cpuRequested }} 
								<template v-if="pod.status !== 'Pending'">
									(avg. load {{ pod.hasOwnProperty('cpuPsiAvg60') ? pod.cpuPsiAvg60 : pod.averageLoad1m }})
								</template>
								
								<template v-for="profile in profiles" v-if="( (profile.name == cluster.data.spec.sgInstanceProfile) && (profile.data.metadata.namespace == cluster.data.metadata.namespace) )">
									<template v-if="( pod.cpuRequested != ( (pod.cpuRequested.includes('m') && !profile.data.spec.cpu.includes('m')) ? ( (profile.data.spec.cpu * 1000) + 'm') : profile.data.spec.cpu ) )">
										<span class="helpTooltip alert" data-tooltip="A CPU change request is pending to be applied"></span>
									</template>
								</template>
							</td>
							<td>
								{{ pod.hasOwnProperty('memoryPsiAvg60') ? pod.memoryPsiAvg60 : pod.memoryRequested }}
								
								<template v-for="profile in profiles" v-if="( (profile.name == cluster.data.spec.sgInstanceProfile) && (profile.data.metadata.namespace == cluster.data.metadata.namespace) )">
									<template v-if="( (pod.hasOwnProperty('memoryPsiAvg60') ? pod.memoryPsiAvg60 : pod.memoryRequested).replace('.00','') != profile.data.spec.memory) ">
										<span class="helpTooltip alert" data-tooltip="A memory change request is pending to be applied"></span>
									</template>
								</template>
							</td>
							<td>
							<template v-if="pod.hasOwnProperty('diskUsed')">{{ pod.diskUsed }}</template><template v-else>-</template> / {{ pod.diskRequested }} <span v-if="pod.hasOwnProperty('diskPsiAvg60')">(psi avg. {{ pod.diskPsiAvg60 }})</span>
							</td>
							<td>{{ pod.containersReady }} / {{ pod.containers }}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="no-data" v-else-if="hasProp(cluster, 'status.pods') && !cluster.status.pods.length">
				No pods yet available
			</div>
			<div class="no-data" v-else>
				Loading cluster status...
			</div>
		</template>
	</div>
</template>

<script>
	import store from '../store'
	import router from '../router'
	import { mixin } from './mixins/mixin'

    export default {
        name: 'ClusterStatus',

		mixins: [mixin],

		data: function() {
			return {
				
			}
		},
		methods: {

		},
		mounted: function() {


		},
		created: function() {

			if ( (store.state.currentCluster.length > 0) && (store.state.currentCluster.name == this.$route.params.name) ) {
				this.dataReady = true;
			}

			this.name = this.$route.params.name;
			this.namespace = this.$route.params.namespace;
			
		},
		computed: {

			clusters () {
				//console.log(store.state.currentCluster);
				//return store.state.currentCluster

				return store.state.clusters
			},
			pods () {
				//console.log(store.state.currentPods);
				return store.state.currentPods
			},
			diskUsed () {
				const vc = this
				
				if( store.state.currentCluster.hasOwnProperty('status') && store.state.currentCluster.status.hasOwnProperty('pods')) {
					let primary = store.state.currentCluster.status.pods.find(p => (p.role == 'primary'))
					let used = vc.getBytes(primary.diskUsed);
					let available = vc.getBytes(store.state.currentCluster.data.spec.pods.persistentVolume.size);
					let percentage = Math.round((used*63)/available);

					return percentage
				} else
					return 0

			},
			notFound () {
				//window.location.href = '/not-found.html';
			},

			tooltips () {
				return store.state.tooltips
			},

			profiles () {
				return store.state.profiles
			}

		},
		beforeDestroy () {
			clearInterval(this.polling);
			//console.log('Interval cleared');
		} 
	}
</script>

<style scoped>
	table.podStatus td {
		position: relative;
	}

	.podStatus .helpTooltip.alert {
		position: absolute;
		top: 13px;
		transform: translateX(5px);
	}

	h2 .helpTooltip.alert {
		top: 2px;
	}
</style>	