terraform {
  required_version = ">= 1.0.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23.0"
    }
  }
}

provider "kubernetes" {
  config_path = var.kube_config_path
}

# Namespace creation for blue green dev
resource "kubernetes_namespace" "demo" {
  metadata {
    name = var.project_namespace
    labels = {
      environment = "demo"
      project     = var.project_name
    }
  }
}

output "namespace_name" {
  value       = kubernetes_namespace.demo.metadata[0].name
  description = "Namepsace description"
}
