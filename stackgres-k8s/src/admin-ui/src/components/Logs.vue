<template>
	<div id="sg-logs" v-if="loggedIn && isReady && !notFound">
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
					Logs
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
				<li v-if="grafanaEmbedded">
					<router-link id="grafana-btn" :to="'/cluster/monitor/'+$route.params.namespace+'/'+$route.params.name" title="Grafana Dashboard" class="grafana">Monitoring</router-link>
				</li>
			</ul>
		</header>

		<div class="content">
			<div id="log">
				<div class="toolbar">
					<div class="searchBar">
						<input id="keyword" v-model="text" class="search" placeholder="Search text..." @keyup="toggleClear('keyword')">
						<a @click="getLogs()" class="btn">APPLY</a>
						<a @click="clearFilters('keyword')" class="btn clear border keyword" style="display:none">CLEAR</a>
					</div>

					<div class="filter">
						<span class="toggle date">DATE RANGE <input v-model="datePicker" id="datePicker" autocomplete="off"></span>
					</div>

					<div class="filter filters">
						<span class="toggle">FILTER</span>

						<ul class="options">
							<li>
								<span>Type</span>
								<label for="logType">
									<span>Postgres</span>
									<input @change="xCheckbox('logType','pg')" v-model="logType" data-filter="logType" type="checkbox" class="xCheckbox" id="logTypepg" name="logTypepg" value="pg"/>
								</label>
								<label for="logType">
									<span>Patroni</span>
									<input @change="xCheckbox('logType','pa')" v-model="logType" data-filter="logType" type="checkbox" class="xCheckbox" id="logTypepa" name="logTypepa" value="pa"/>
								</label>
							</li>

							<li>
								<span>Role</span>
								<select v-model="role" @change="toggleClear('filters')">
									<option value=''>All Roles</option>
									<option>Primary</option>
									<option>Replica</option>
									<option>Promoted</option>
									<option>Demoted</option>
									<option>Uninitialized</option>
									<option>Standby</option>
								</select>
							</li>

							<li>
								<span>Error Level</span>
								<select v-model="errorLevel" @change="toggleClear('filters')">
									<option value=''>All levels</option>
									<option>PANIC</option>
									<option>CRITICAL</option>
									<option>FATAL</option>
									<option>LOG</option>
									<option>ERROR</option>
									<option>WARNING</option>
									<option>NOTICE</option>
									<option>INFO</option>
									<option>DEBUG</option>
									<option>NOT SET</option>
								</select>
							</li>
							<li class="textFilter">
								<span>Pod Name</span>
								<input v-model="podName" class="search" @keyup="toggleClear('filters')">
								<span class="btn clear border" @click="clearFilters('podName')" v-if="podName.length">×</span>
							</li>
							<li class="textFilter">
								<span>User Name</span>
								<input v-model="userName" class="search" @keyup="toggleClear('filters')">
								<span class="btn clear border" @click="clearFilters('userName')" v-if="userName.length">×</span>
							</li>
							<li class="textFilter">
								<span>Database Name</span>
								<input v-model="databaseName" class="search" @keyup="toggleClear('filters')">
								<span class="btn clear border" @click="clearFilters('databaseName')" v-if="databaseName.length">×</span>
							</li>
							<li>
								<hr>
								<a class="btn" @click="getLogs()">APPLY</a> <a class="btn clear border" @click="clearFilters('filters')" style="display:none">CLEAR</a>
							</li>
						</ul>
					</div>

					<div class="filter columns" :class="filteredColumns ? 'filtered' : ''">
						<span class="toggle">VISIBLE COLUMNS</span>

						<ul class="options">
							<li>
								<label for="viewLogType">
									<span>Log Type</span>
									<input @change="toggleColumn('logType')" type="checkbox" id="viewLogType" checked/>
								</label>
							</li>
							<li>
								<label for="viewErrorLevel">
									<span>Error Level</span>
									<input @change="toggleColumn('errorLevel')" type="checkbox" id="viewErrorLevel" checked/>
								</label>
							</li>
							<li>
								<label for="viewPodName">
									<span>Pod Name</span>
									<input @change="toggleColumn('podName')" type="checkbox" id="viewPodName" checked/>
								</label>
							</li>
							<li>
								<label for="viewRole">
									<span>Role</span>
									<input @change="toggleColumn('role')" type="checkbox" id="viewRole" checked/>
								</label>
							</li>
							<li>
								<label for="viewLogMessage">
									<span>Message</span>
									<input @change="toggleColumn('logMessage')" type="checkbox" id="viewLogMessage" checked/>
								</label>
							</li>
							<li>
								<label for="viewUserName">
									<span>User</span>
									<input @change="toggleColumn('userName')" type="checkbox" id="viewUserName" checked/>
								</label>
							</li>
							<li>
								<label for="viewDatabaseName">
									<span>Database</span>
									<input @change="toggleColumn('databaseName')" type="checkbox" id="viewDatabaseName" checked/>
								</label>
							</li>
							<li>
								<label for="viewProcessId">
									<span>Process ID</span>
									<input @change="toggleColumn('processId')" type="checkbox" id="viewProcessId" checked/>
								</label>
							</li>
							<li>
								<label for="viewConnectionFrom">
									<span>Connection From</span>
									<input @change="toggleColumn('connectionFrom')" type="checkbox" id="viewConnectionFrom" checked/>
								</label>
							</li>
							<li>
								<label for="viewApplicationName">
									<span>Application</span>
									<input @change="toggleColumn('applicationName')" type="checkbox" id="viewApplicationName" checked/>
								</label>
							</li>
						</ul>
					</div>

					<!--<div class=calendar>
						<ul>
							<li><span class="shortcut" @click="setTime('1m')">1 m</span></li>
							<li><span class="shortcut" @click="setTime('30m')">30 m</span></li>
							<li><span class="shortcut" @click="setTime('3h')">3 h</span></li>
							<li><span class="shortcut" @click="setTime('1d')">1 d</span></li>
							<li><span><svg xmlns="http://www.w3.org/2000/svg" width="15.002" height="16.503" viewBox="0 0 15.002 16.503"><g transform="translate(-3.75 -2.25)"><path d="M6,6H16.5A1.5,1.5,0,0,1,18,7.5V18a1.5,1.5,0,0,1-1.5,1.5H6A1.5,1.5,0,0,1,4.5,18V7.5A1.5,1.5,0,0,1,6,6Z" transform="translate(0 -1.499)" fill="none" stroke="#7a7b85" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M24,3V6" transform="translate(-9.749)" fill="none" stroke="#7a7b85" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M12,3V6" transform="translate(-3.75)" fill="none" stroke="#7a7b85" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M4.5,15H18" transform="translate(0 -5.999)" fill="none" stroke="#7a7b85" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></g></svg> <input v-model="datePicker" id="datePicker" autocomplete="off"></span></li>
						</ul>
					</div>-->
				</div>

				<table class="logs" v-on:scroll.passive="handleScroll">
					<thead class="sort">
						<th class="logTime sorted desc timestamp">
							<span @click="sort()">Log Time</span>
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.logTime')"></span>
						</th>
						<th class="logType center label" v-if="showColumns.logType">
							Type
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.logType')"></span>
						</th>
						<th class="errorLevel center" v-if="showColumns.errorLevel">
							Error Level
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.errorLevel')"></span>
						</th>
						<th class="podName" v-if="showColumns.podName">
							Pod Name
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.podName')"></span>
						</th>
						<th class="role center label" v-if="showColumns.role">
							Role
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.role')"></span>
						</th>
						<th class="logMessage" v-if="showColumns.logMessage">
							Message
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.message')"></span>
						</th>
						<th class="userName" v-if="showColumns.userName">
							User
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.userName')"></span>
						</th>
						<th class="databaseName" v-if="showColumns.databaseName">
							Database
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.databaseName')"></span>
						</th>
						<th class="processId" v-if="showColumns.processId">
							Process ID
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.processId')"></span>
						</th>
						<th class="connectionFrom" v-if="showColumns.connectionFrom">
							Connection From
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.connectionFrom')"></span>
						</th>
						<th class="applicationName" v-if="showColumns.applicationName">
							Application
							<span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.applicationName')"></span>
						</th>
					</thead>
					<tbody>
						<tr class="no-results">
							<td colspan="999">
								No records matched your search terms
							</td>
						</tr>
						<template v-for="(log, logIndex) in logs">
							<template v-if="log.logType === 'pg'">
								<tr :id="'log-'+logIndex" :class="(($route.params.time === log.logTime) && ($route.params.index === log.logTimeIndex)) ? 'open' : ''" class="base" @click="toggleLogDetails(logIndex)">
									<td class="timestamp logTime">
										<span class='date'>
											{{ log.logTime | formatTimestamp('date') }}
										</span>
										<span class='time'>
											{{ log.logTime | formatTimestamp('time') }}
										</span>
										<span class='ms'>
											{{ log.logTime | formatTimestamp('ms') }}
										</span>
									</td>
									<td class="logType label postgres center" v-if="showColumns.logType">
										<span>Postgres</span>
									</td>
									<td class="errorLevel label center" :class="log.errorLevel" v-if="showColumns.errorLevel">
										<span>{{ log.errorLevel }}</span>
									</td>
									<td class="podName hasTooltip" v-if="showColumns.podName">
										<span>{{ log.podName }}</span>
									</td>
									<td class="role label center" :class="log.role" v-if="showColumns.role">
										<span>{{ log.role }}</span>
									</td>
									<td class="logMessage hasTooltip" v-if="showColumns.logMessage">
										<span>{{ log.message }}</span>
									</td>
									<td class="userName hasTooltip" v-if="showColumns.userName">
										<span>{{ log.userName }}</span>
									</td>
									<td class="databaseName hasTooltip" v-if="showColumns.databaseName">
										<span>{{ log.databaseName }}</span>
									</td>
									<td class="processId" v-if="showColumns.processId">
										<span>{{ log.processId }}</span>
									</td>
									<td class="connectionFrom hasTooltip" v-if="showColumns.connectionFrom">
										<span>{{ log.connectionFrom }}</span>
									</td>
									<td class="applicationName hasTooltip" v-if="showColumns.applicationName">
										<span>{{ log.applicationName }}</span>
									</td>
								</tr>
							</template>
							<template v-else>
								<tr :id="'log-'+logIndex" :class="(($route.params.time === log.logTime) && ($route.params.index === log.logTimeIndex)) ? 'open' : ''"  class="base" @click="toggleLogDetails(logIndex)">
									<td class="timestamp logTime">
										<span class='date'>
											{{ log.logTime | formatTimestamp('date') }}
										</span>
										<span class='time'>
											{{ log.logTime | formatTimestamp('time') }}
										</span>
										<span class='ms'>
											{{ log.logTime | formatTimestamp('ms') }}
										</span>
									</td>
									<td class="logType label patroni center" v-if="showColumns.logType">
										<span>Patroni</span>
									</td>
									<td class="errorLevel label center" :class="log.errorLevel" v-if="showColumns.errorLevel">
										<span>{{ log.errorLevel }}</span>
									</td>
									<td class="podName hasTooltip" v-if="showColumns.podName">
										<span>{{ log.podName }}</span>
									</td>
									<td class="role label center" :class="log.role" v-if="showColumns.role">
										<span>{{ log.role }}</span>
									</td>
									<td class="logMessage hasTooltip" v-if="showColumns.logMessage">
										<span>{{ log.message }}</span>
									</td>
									<td class="userName" v-if="showColumns.userName"></td>
									<td class="databaseName" v-if="showColumns.databaseName"></td>
									<td class="processId" v-if="showColumns.processId"></td>
									<td class="connectionFrom" v-if="showColumns.connectionFrom"></td>
									<td class="applicationName" v-if="showColumns.applicationName"></td>
								</tr>
							</template>
							<tr class="logInfo">
								<td colspan="999">
									<div class="header">
										<span class="timestamp">
											<span class='date'>
												{{ log.logTime | formatTimestamp('date') }}
											</span>
											<span class='time'>
												{{ log.logTime | formatTimestamp('time') }}
											</span>
											<span class='ms'>
												{{ log.logTime | formatTimestamp('ms') }}
											</span>
										</span>
										<span class="closeLog">✕</span>
									</div>
									<table class="logMessage">
										<tbody>
											<tr>
												<td class="param">Message <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.message')"></span></td>
												<td class="value">{{ log.message }}</td>
											</tr>
										</tbody>
									</table>
									<div class="logDetails postgres" v-if="log.logType === 'pg'">
										<table>
											<tbody>
												<tr>
													<td class="param">Type <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.logType')"></span></td>
													<td class="value label logType pg"><span>Postgres</span></td>
												</tr>
												<tr v-if="log.hasOwnProperty('podName')">
													<td class="param">Pod Name <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.podName')"></span></td>
													<td class="value">{{ log.podName }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('role')">
													<td class="param">Role <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.role')"></span></td>
													<td class="value label role" :class="log.role">
														<span>{{ log.role }}</span>
													</td>
												</tr>
												<tr v-if="log.hasOwnProperty('userName')">
													<td class="param">User <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.userName')"></span></td>
													<td class="value">{{ log.userName }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('databaseName')">
													<td class="param">Database <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.databaseName')"></span></td>
													<td class="value">{{ log.databaseName }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('processId')">
													<td class="param">Process ID <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.processId')"></span></td>
													<td class="value">{{ log.processId }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('connectionFrom')">
													<td class="param">Connection From <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.connectionFrom')"></span></td>
													<td class="value">{{ log.connectionFrom }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('sessionId')">
													<td class="param">Session ID <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.sessionId')"></span></td>
													<td class="value">{{ log.sessionId }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('sessionLineNum')">
													<td class="param">Session Line Number <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.sessionLineNum')"></span></td>
													<td class="value">{{ log.sessionLineNum }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('commandTag')">
													<td class="param">Command Tag <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.commandTag')"></span></td>
													<td class="value">{{ log.commandTag }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('sessionStartTime')">
													<td class="param">Session Start Time <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.sessionStartTime')"></span></td>
													<td class="value">{{ log.sessionStartTime }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('virtualTransactionId')">
													<td class="param">Virtual Transaction ID <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.virtualTransactionId')"></span></td>
													<td class="value">{{ log.virtualTransactionId }}</td>
												</tr>
											</tbody>
										</table>
										
										<table>
											<tbody>
												<tr v-if="log.hasOwnProperty('transactionId')">
													<td class="param">Transaction ID <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.transactionId')"></span></td>
													<td class="value">{{ log.transactionId }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('errorLevel')">
													<td class="param">Error Level <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.errorLevel')"></span></td>
													<td class="value label errorLevel" :class="log.errorLevel"><span>{{ log.errorLevel }}</span></td>
												</tr>
												<tr v-if="log.hasOwnProperty('sqlStateCode')">
													<td class="param">SQL State Code <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.sqlStateCode')"></span></td>
													<td class="value">{{ log.sqlStateCode }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('detail')">
													<td class="param">Detail <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.detail')"></span></td>
													<td class="value">{{ log.detail }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('hint')">
													<td class="param">Hint <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.hint')"></span></td>
													<td class="value">{{ log.hint }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('internalQuery')">
													<td class="param">Internal Query <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.internalQuery')"></span></td>
													<td class="value">{{ log.internalQuery }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('internalQueryPos')">
													<td class="param">Internal Query Pos <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.internalQueryPos')"></span></td>
													<td class="value">{{ log.internalQueryPos }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('context')">
													<td class="param">Context <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.context')"></span></td>
													<td class="value">{{ log.context }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('query')">
													<td class="param">Query <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.query')"></span></td>
													<td class="value">{{ log.query }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('queryPos')">
													<td class="param">Query Pos <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.queryPos')"></span></td>
													<td class="value">{{ log.queryPos }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('location')">
													<td class="param">Location <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.location')"></span></td>
													<td class="value">{{ log.location }}</td>
												</tr>
												<tr v-if="log.hasOwnProperty('applicationName')">
													<td class="param">Application Name <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.applicationName')"></span></td>
													<td class="value">{{ log.applicationName }}</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div v-else-if="log.logType === 'pa'" class="logDetails patroni">
										<table>
											<tbody>
												<tr>
													<td class="param">Type <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.logType')"></span></td>
													<td class="value label logType pa"><span>Patroni</span></td>
												</tr>
												<tr>
													<td class="param">Pod Name <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.podName')"></span></td>
													<td class="value">{{ log.podName }}</td>
												</tr>
											</tbody>
										</table>
										<table>
											<tbody>
												<tr v-if="log.hasOwnProperty('role')">
													<td class="param">Role <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.role')"></span></td>
													<td class="value label role" :class="log.role">
														<span>{{ log.role }}</span>
													</td>
												</tr>
												<tr v-if="log.hasOwnProperty('errorLevel')">
													<td class="param">Error Level <span class="helpTooltip" :data-tooltip="getTooltip('sgclusterlogentry.errorLevel')"></span></td>
													<td class="value label errorLevel" :class="log.errorLevel"><span>{{ log.errorLevel }}</span></td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</div>
		<div id="logTooltip">
			<div class="info"></div>
		</div>
	</div>
</template>

<script>
	import store from '../store'
	import axios from 'axios'
	import { mixin } from './mixins/mixin'

    export default {
        name: 'Logs',

		mixins: [mixin],

		data: function() {

			return {
				currentSortDir: 'desc',
				records: 50,
				fetching: false,
				lastCall: '',
				text: '',
				logType: [],
				errorLevel: '',
				podName: '',
				role: '',
				userName: '',
				databaseName: '',
				datePicker: '',
				dateStart: '',
				dateEnd: '',
				showColumns: {
					logType: true,
					errorLevel: true,
					podName: true,
					role: true,
					logMessage: true,
					userName: true,
					databaseName: true,
					processId: true,
					connectionFrom: true,
					applicationName: true
				},
			}
		},
		computed: {

			clusters () {
				return store.state.clusters
			},

			logs() {
				return store.state.logs
			},
			
			grafanaEmbedded() {
				var grafana = false;
				const vm = this;
				
				store.state.clusters.forEach(function( c ){
					if( (c.data.metadata.name === vm.$route.params.name) && (c.data.metadata.namespace === vm.$route.params.namespace) && c.data.grafanaEmbedded ) {
						grafana = true;
						return false;
					}
				});
				
				return grafana            
			},

			filteredColumns() {
				var filtered = false;
				const vm = this;

				Object.entries(vm.showColumns).forEach(([key, value]) => {
					if(!value) {
						filtered = true;
						return false;
					}
				});
					
				return filtered
			},

			cluster() {
				return store.state.currentCluster
			},

			tooltips() {
				return store.state.tooltips
			}

		},
		mounted: function() {
			
			const vc = this;

			$(document).ready(function(){

				$(document).on('focus', '#datePicker', function() {

                    if(!$(this).val()) {
						
						$('#datePicker').daterangepicker({
							"parentEl": "#log",
							"autoApply": true,
							"timePicker": true,
							"timePicker24Hour": true,
							"timePickerSeconds": true,
							"opens": "left",
							locale: {
								cancelLabel: "Clear"
							}
						}, function(start, end, label) {

							if(vc.currentSortDir === 'asc') {
								vc.dateStart = start.format('YYYY-MM-DDTHH:mm:ss');
								vc.dateEnd = end.format('YYYY-MM-DDTHH:mm:ss');
							} else {
								vc.dateEnd = start.format('YYYY-MM-DDTHH:mm:ss');
								vc.dateStart = end.format('YYYY-MM-DDTHH:mm:ss');
							}

							vc.datePicker = vc.dateStart+' / '+vc.dateEnd;
							vc.getLogs(false, true);
						});

						$('#datePicker').on('show.daterangepicker', function(ev, picker) {
							//console.log('show.daterangepicker');
							$('#datePicker').parent().addClass('open');
						});

						$('#datePicker').on('hide.daterangepicker', function(ev, picker) {
							//console.log('hide.daterangepicker');
							$('#datePicker').parent().removeClass('open');

							if($('#datePicker').val().length)
								$('#datePicker').parent().parent().addClass('filtered')
							else
								$('#datePicker').parent().parent().removeClass('filtered')
						});

						$('#datePicker').on('cancel.daterangepicker', function(ev, picker) {
							//console.log('cancel.daterangepicker');
							vc.datePicker = '';
							vc.dateStart = '';
							vc.dateEnd = '';

							$('#datePicker').parent().parent().removeClass('filtered')
							
							vc.getLogs();
							$('#datePicker').parent().removeClass('open');
						});

						$('#datePicker').on('apply.daterangepicker', function(ev, picker) {
							//console.log('apply.daterangepicker');
							$('#datePicker').parent().removeClass('open');

							if($('#datePicker').val().length)
								$('#datePicker').parent().parent().addClass('filtered')
							else
								$('#datePicker').parent().parent().removeClass('filtered')
								
						});

					}
				})
			
				vc.records = parseInt((window.innerHeight - 350) / 30);
				vc.getLogs(this.records);

				$(document).on('mousemove', function (e) {

					if( (window.innerWidth - e.clientX) > 420 ) {
						$('#logTooltip').css({
							"top": e.clientY+20, 
							"right": "auto",
							"left": e.clientX+20
						})
					} else {
						$('#logTooltip').css({
							"top": e.clientY+20, 
							"left": "auto",
							"right": window.innerWidth - e.clientX + 20
						})
					}
				})

				$(document).on('mouseenter', 'td.hasTooltip', function(){
					c = $(this).children('span');
					if(c.width() > $(this).width()){
						$('#logTooltip .info').text(c.text());
						$('#logTooltip').addClass('show');
					}
						
				});

				$(document).on('mouseleave', 'td.hasTooltip', function(){ 
					$('#logTooltip .info').text('');
					$('#logTooltip').removeClass('show');
				});

				$(document).on('click', '.closeLog', function(){
					$(this).parents('tr').prev().toggle();
					$(this).parents('tr').toggleClass('open');
				});

				$(document).on('keyup', 'input.search', function(e){
					if (e.keyCode === 13)
						vc.getLogs();
				});
				
				$(document).on('click', '#datePicker', function(){
					$(this).parent().toggleClass('open');
				});

				$(document).on('change', '.filter select', function () {
					if($(this).val().length)
						$(this).addClass('active')
					else
						$(this).removeClass('active')
				});

				$(window).on('resize', function() {
					if(($('table.logs').height() - 40) > $('table.logs > tbody').height()) {
						vc.records = parseInt((window.innerHeight - 350) / 30);
						vc.getLogs(vc.records);
					}			
				})

			});

		},
		methods: {

			toggleColumn( column ) {
				this.showColumns[column] = !this.showColumns[column]
			},

			xCheckbox(param, value) {

				vc = this;

				el = $('#'+param+value);

				if(el.is(':checked')) {
					el.parents('li').find('.active').removeClass('active').prop('checked', false);
					//el.addClass('active');
					el.parent().addClass('active');

					if(vc[el.data('filter')].length)
						vc[el.data('filter')] = [el.val()];
				} else {
					el.parent().removeClass('active');
					vc[el.data('filter')] = [];
				}

				this.toggleClear('filters')

				//vc.getLogs();
			},

			toggleClear( filter ){

				switch(filter) {
					case 'keyword':
						if($('#keyword').val().length)
							$('.searchBar .clear').fadeIn()
						else
							$('.searchBar .clear').fadeOut()
						
							break;
					case 'filters':
						if($('.filters .options .active').length || $('.filters .options .search').val().length || this.errorLevel.length || this.role.length )
							$('.filters .clear').fadeIn()
						else
							$('.filters .clear').fadeOut()
				}

			},

			clearFilters ( section ) {

				if(section == 'filters') {
					this.logType = [];
					this.errorLevel = '';
					this.podName = '';
					this.role = '';
					this.userName = '';
					this.databaseName = '';
					$('.filter.open .active').removeClass('active');

					$('.filters .clear').fadeOut()

				} else if (section == 'keyword') {
					this.text = '';
					$('#keyword').removeClass('active')

					$('.searchBar .clear').fadeOut()
				} else {
					this[section] = '';
				}
				
				this.getLogs();
			},

			getLogs(append = false, byDate = false) {

				let vc = this;

				vc.fetching = true;

				$('table.logs').addClass('loading');

				let params = '';

				params += '?records='+this.records;
				params += '&sort='+this.currentSortDir;
				
				if(this.dateStart.length && byDate)
					params += '&from='+this.dateStart;
				
				if(this.dateEnd.length && byDate)
					params += '&to='+this.dateEnd;

				if(this.text.length) {
					params += '&text='+this.text;
					$('.searchBar').addClass('filtered')
				} else {
					$('.searchBar').removeClass('filtered')
				}

				if(this.logType.length)
					params += '&logType='+this.logType[0];

				if(this.errorLevel.length)
					params += '&errorLevel='+this.errorLevel;

				if(this.podName.length)
					params += '&podName='+this.podName;

				if(this.role.length) {
					params += '&role='+this.role;
				}
				
				if( (store.state.loginToken.search('Authentication Error') == -1) ) {

					let thisCall = '/stackgres/sgcluster/logs/'+this.$route.params.namespace+'/'+this.$route.params.name+params;
					
					if (this.lastCall != thisCall) {

						this.lastCall = thisCall;

						axios
						.get(thisCall)
						.then( function(response){

							if(append)
								store.commit('appendLogs', response.data)
							else
								store.commit('setLogs', response.data)

							$('table.logs').removeClass('loading');
							vc.fetching = false;
							
						}).catch(function(err) {
							vc.notify(
								{
								title: 'Error',
								detail: 'There was an error while trying to fetch the information from the API, please refresh the window and try again.'
								},
								'error'
							);

							store.commit('setLogs', []);
							console.log(err);
							checkAuthError(err);

							$('table.logs').removeClass('loading');
							vc.fetching = false;
						});
					}
				} else {
					vc.notify(
						{
						title: store.state.loginToken,
						detail: 'There was an authentication error while trying to fetch the information from the API, please refresh the window and try again.'
						},
						'error'
					);
				}

				$('.logInfo.open').prev().toggle();
				$('.logInfo.open').toggleClass('open');

			},

			sort() {

				var auxDate = this.dateStart;
				this.dateStart = this.dateEnd;
				this.dateEnd = auxDate;
				
				if(this.currentSortDir == 'desc')
					this.currentSortDir = 'asc'
				else
					this.currentSortDir = 'desc'

				this.getLogs()
			},

			setTime(time) {

				vc = this;

				switch(time) {

					case '1d':
						if(vc.currentSortDir == 'asc') {
							vc.dateStart = store.state.logs[0].logTime+','+store.state.logs[0].logTimeIndex;

							date.setHours(23,59,59,59);
							vc.dateEnd = date.format('YYYY-MM-DDTHH:mm:ss');
						} else {
							date.setHours(23,59,59,59);
							vc.dateStart = date.format('YYYY-MM-DDTHH:mm:ss');

							date.setHours(0,0,0,0);
							vc.dateEnd = date.format('YYYY-MM-DDTHH:mm:ss');
						}
						
						$('#datePicker').data('daterangepicker').setStartDate(vc.dateStart);
						$('#datePicker').data('daterangepicker').setEndDate(vc.dateEnd);
						break;

				}

			},

			toggleLogDetails( id ) {

				let row;

				$('tr.logInfo.open').prev().toggle();
				$('tr.logInfo.open').removeClass('open');
				$('#log-'+id).toggle();
				$('#log-'+id).next().toggleClass('open');
				
			},

			filterLogs() {

				let vc = this;
			},

			handleScroll() {
				let vc = this;

				if( ($('table.logs').scrollTop() + $('table.logs').innerHeight() >= $('table.logs')[0].scrollHeight) && store.state.logs.length && !vc.fetching && ($('table.logs').get(0).scrollHeight > $('table.logs').get(0).clientHeight)) {
					ltime = store.state.logs[store.state.logs.length-1].logTime;
					lindex = store.state.logs[store.state.logs.length-1].logTimeIndex;
					vc.dateStart = ltime+','+lindex;
					vc.getLogs(true, true);
				}
			}

		},
		beforeDestroy: function() {
			store.commit('setLogs', []);
		}
	}
</script>