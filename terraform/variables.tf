variable "kube_config_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Path to the local kubeconfig file"
}

variable "project_name" {
  type        = string
  default     = "devops-proj"
  description = "Name of the project"
}

variable "project_namespace" {
  type        = string
  default     = "blue-green-demo"
  description = "Target Kubernetes namespace for deployment"
}
