# DevOps Project Architecture Walkthrough

This document provides a comprehensive, beginner-friendly explanation of how the frontend packaging, Nginx reverse proxy, Terraform Infrastructure-as-Code (IaC), and Jenkins environment integrations function in your Blue-Green deployment workspace.

---

## 1. Dockerfile Conditional Packaging

### The Code
```dockerfile
# Build argument to choose which version to package
ARG VERSION=blue

RUN if [ "$VERSION" = "green" ]; then cp src-green/App.jsx src/App.jsx; fi
```

### What it Means
This logic acts as a switch during the container image building process:

1. **`ARG VERSION=blue`**: Defines a build-time argument named `VERSION`. If no value is provided, it defaults to `"blue"`. 
   > [!NOTE]
   > Unlike runtime environment variables, `ARG` values are only available while the image is being built, not when the container is running.
2. **`RUN if [ "$VERSION" = "green" ]; then cp src-green/App.jsx src/App.jsx; fi`**: 
   * When building the **Green** image, Jenkins runs:  
     `docker build --build-arg VERSION=green ...`
   * The condition matches (`$VERSION` is `"green"`), so the shell copies the Green UI code from `src-green/App.jsx` into `src/App.jsx`, overwriting the default file.
   * When building the **Blue** image, Jenkins runs with `--build-arg VERSION=blue`. The condition is skipped, leaving the default Blue code intact in `src/App.jsx`.

This keeps your frontend code clean and allows you to compile both environments from a single git branch!

---

## 2. Nginx Reverse Proxy & Routing Config (`nginx.conf`)

### The Code
```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }
    
    location /api {
        proxy_pass http://backend-service:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### What it Means

#### A. The Server Listener (`listen 80;`)
This configures Nginx inside the container to listen for standard HTTP traffic on port `80`.

#### B. Location `/` (Serving the React SPA)
* **`root /usr/share/nginx/html;`**: Tells Nginx where to look for static files (HTML, JS, CSS) built by Vite.
* **`index index.html;`**: Serves `index.html` as the default entry point.
* **`try_files $uri /index.html;`**: **Crucial for Single Page Applications (SPAs).** When a user types a virtual URL route in their browser (like `/dashboard`), Nginx looks for a folder or file named `/dashboard`. Since it doesn't exist on disk, Nginx falls back to `/index.html`, allowing React Router inside the browser to intercept and render the page correctly without throwing a `404 Not Found` error.
* **`add_header Cache-Control ...` / `Pragma` / `Expires 0`**: These headers **completely disable browser caching**. 
  > [!IMPORTANT]
  > Disabling cache is critical for Blue-Green deployments! Without these headers, a user's browser might cache the Blue frontend files. When you switch the service selector to Green, the user would still see the cached Blue version until they force-refresh.

#### C. Location `/api` (Reverse Proxy to the Backend NodePort/ClusterIP)
* **`proxy_pass http://backend-service:5000;`**: Forwards any request starting with `/api` (e.g., `/api/health`) directly to the Kubernetes backend service named `backend-service` on port `5000`.
* **Headers (`Upgrade`, `Connection`, `Host`)**: Configures connection upgrades (necessary if your backend uses WebSockets) and forwards the original host request headers to the backend rather than masking them.

---

## 3. Terraform & Centralizing Kubernetes Namespaces

### The Code
```hcl
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
  description = "Namespace description"
}
```

### What it Means

#### A. Initializing Providers (`terraform {}` & `provider "kubernetes"`)
* **`terraform {}`**: Declares that this code requires Terraform CLI version `1.0.0` or higher, and specifies that HashiCorp's official `kubernetes` provider is used to communicate with the cluster.
* **`provider "kubernetes"`**: Tells Terraform how to authenticate. It reads the local Kubernetes configuration from `kube_config_path` (which points to `~/.kube/config`).

#### B. Resources & Outputs
* **`resource "kubernetes_namespace" "demo"`**: Tells Terraform to provision a physical namespace inside your Kubernetes cluster.
* **`output "namespace_name"`**: Prints the resulting namespace name to the terminal screen once Terraform finishes applying the plan, allowing subsequent build steps or developers to capture it.

---

### What is a Variable?
A **Variable** in Terraform works exactly like a function argument or a global variable in programming:
* Instead of hardcoding paths or names directly inside resources, you define a `variable "name" { default = "..." }`.
* If you want to change the target namespace from `blue-green-demo` to `dev-environment`, you don't need to hunt through your infrastructure code. You simply override the variable value (either via a `terraform.tfvars` file, environment variables, or a command line argument).

### How Terraform Centralizes Namespacing
By defining variables in Terraform:
```hcl
variable "project_namespace" {
  type        = string
  default     = "blue-green-demo"
}
```
You establish a single source of truth. If you want to deploy the entire stack to a different namespace (e.g. `production` instead of `blue-green-demo`):
1. You pass `-var="project_namespace=production"` to Terraform.
2. Terraform creates the new namespace.
3. Your CI/CD pipelines and scripts can fetch this name dynamically, preventing manual typing mistakes and centralizing all resource boundaries.

---

## 4. Jenkins Agent Architecture & System Variables

### The Code
```groovy
pipeline {
    agent any
    environment {
        KUBECONFIG    = '/var/lib/jenkins/.kube/config'
        MINIKUBE_HOME = '/var/lib/jenkins'
    }
    // ...
}
```

### A. What is `agent any` in a Jenkins Pipeline?
* In a production DevOps ecosystem, Jenkins consists of a **Controller** (which hosts the UI and schedules jobs) and **Agents/Workers** (separate servers or containers that actually compile code, run tests, and execute shells).
* **`agent any`** tells Jenkins: *"Run this build on any available agent machine or executor that is currently free."* 
* If you had a specialized server for running Kubernetes deployments, you might write `agent { label 'k8s-deployer' }`. `agent any` is the simplest, most flexible rule for single-server setups.

---

### B. Why are we passing these environment variables?
```groovy
environment {
    KUBECONFIG    = '/var/lib/jenkins/.kube/config'
    MINIKUBE_HOME = '/var/lib/jenkins'
}
```

When Jenkins runs, it runs under a dedicated, unprivileged system user account (usually named `jenkins`). 

#### 1. `KUBECONFIG = '/var/lib/jenkins/.kube/config'`
* When you run `kubectl apply` or `kubectl patch`, the `kubectl` CLI tool needs to know **where** your cluster is and **how** to authenticate (SSL certificates, keys, etc.).
* By default, it searches in the user's home directory under `~/.kube/config`.
* By setting `KUBECONFIG` explicitly to `/var/lib/jenkins/.kube/config`, we guarantee that the `jenkins` user will look in its own home subdirectory for the certificates it needs to communicate with Minikube, avoiding authentication errors.

#### 2. `MINIKUBE_HOME = '/var/lib/jenkins'`
* Minikube holds local state, cluster definitions, certificates, and caches.
* When the Jenkins script executes `minikube ip` or `eval $(minikube docker-env)`, Minikube looks at `MINIKUBE_HOME` to find the control plane configuration files.
* Without setting this, the pipeline shell will look in the standard user path, fail to find Minikube's configuration, and raise errors like: `minikube is not running` or `unable to find minikube credentials`.

By injecting these two environment variables, we ensure that Jenkins has direct, authenticated, and stable access to your Minikube cluster and its Docker environment.
