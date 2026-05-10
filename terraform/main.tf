# Terraform config for local Docker provider (demonstration)
# This provisions the same stack as docker-compose but via Terraform

terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# ---------- Network ----------
resource "docker_network" "devops_net" {
  name = "devops-net-tf"
}

# ---------- Backend ----------
resource "docker_image" "backend" {
  name = "tasks-backend:latest"
  build {
    context    = "${path.module}/../backend"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "backend" {
  name  = "tasks-backend-tf"
  image = docker_image.backend.image_id
  ports {
    internal = 8000
    external = 8000
  }
  networks_advanced {
    name = docker_network.devops_net.name
  }
  restart = "unless-stopped"
}

# ---------- Prometheus ----------
resource "docker_image" "prometheus" {
  name = "prom/prometheus:latest"
}

resource "docker_container" "prometheus" {
  name  = "prometheus-tf"
  image = docker_image.prometheus.image_id
  ports {
    internal = 9090
    external = 9090
  }
  volumes {
    host_path      = abspath("${path.module}/../monitoring/prometheus.yml")
    container_path = "/etc/prometheus/prometheus.yml"
  }
  command = ["--config.file=/etc/prometheus/prometheus.yml"]
  networks_advanced {
    name = docker_network.devops_net.name
  }
  restart    = "unless-stopped"
  depends_on = [docker_container.backend]
}

# ---------- Grafana ----------
resource "docker_image" "grafana" {
  name = "grafana/grafana:latest"
}

resource "docker_container" "grafana" {
  name  = "grafana-tf"
  image = docker_image.grafana.image_id
  ports {
    internal = 3000
    external = 3001
  }
  env = [
    "GF_SECURITY_ADMIN_USER=admin",
    "GF_SECURITY_ADMIN_PASSWORD=admin",
    "GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/dashboard.json",
  ]
  volumes {
    host_path      = abspath("${path.module}/../monitoring/grafana/provisioning")
    container_path = "/etc/grafana/provisioning"
  }
  volumes {
    host_path      = abspath("${path.module}/../monitoring/grafana/dashboards")
    container_path = "/var/lib/grafana/dashboards"
  }
  networks_advanced {
    name = docker_network.devops_net.name
  }
  restart    = "unless-stopped"
  depends_on = [docker_container.prometheus]
}

# ---------- Outputs ----------
output "backend_url" {
  value = "http://localhost:8000"
}

output "prometheus_url" {
  value = "http://localhost:9090"
}

output "grafana_url" {
  value = "http://localhost:3001  (admin/admin)"
}
