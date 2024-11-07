{{/*
Expand the name of the chart.
*/}}
{{- define "sonarqube-dashboard.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "sonarqube-dashboard.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := include "sonarqube-dashboard.name" . -}}
{{- if .Release.Name -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end }}

{{/*
Common labels
*/}}
{{- define "sonarqube-dashboard.labels" -}}
helm.sh/chart: {{ include "sonarqube-dashboard.chart" . }}
{{ include "sonarqube-dashboard.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "sonarqube-dashboard.selectorLabels" -}}
app.kubernetes.io/name: {{ include "sonarqube-dashboard.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Chart name and version
*/}}
{{- define "sonarqube-dashboard.chart" -}}
{{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}
