# 🚀 devops-proj Quick Run Guide

A local-first, zero-manual-intervention **Blue-Green Deployment demo** managed entirely by Jenkins and Terraform.

---

## ⚡ Step 1: Start Minikube & Connect shell
```bash
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
eval $(minikube docker-env)
```

---

## 📊 Step 2: Boot Prometheus & Grafana Monitoring
```bash
# Add Helm Repo & Install Stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Apply service scraping rules and custom alerts
kubectl apply -f k8s/servicemonitor.yaml
kubectl apply -f prometheus/alert-rules.yaml
```

### Expose Dashboards (Run in separate terminal sessions):
```bash
# Access Grafana dashboard at http://localhost:3000 (user: admin | pass: prom-operator)
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring

# Access Prometheus dashboard at http://localhost:9090
kubectl port-forward svc/monitoring-prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

*Configure these three Grafana metrics panels: `rate(http_requests_total[1m])`, `rate(http_requests_total{status=~"5.."}[1m])`, and `kube_pod_status_ready{namespace="blue-green-demo"}`.*

---

## 🌐 Step 3: Run ngrok & Configure Webhook
```bash
# Start the Jenkins tunnel
ngrok http 8080
```
1. Copy the public HTTPS URL (e.g. `https://xyz123.ngrok-free.app`).
2. Go to your GitHub Repository -> **Settings** -> **Webhooks** -> **Add Webhook**:
   * **Payload URL**: `https://xyz123.ngrok-free.app/github-webhook/`
   * **Content type**: `application/json`
   * **Event**: `Just the push event`

---

## 🎬 Step 4: The 3-Step Demo Flow

Access your active frontend at **`http://<minikube-ip>:30080`** (or run `minikube service frontend-service --url -n blue-green-demo`).

### 1. Deploy Stable Green 🟢
Push the code as is. The health check succeeds (`200 OK`). Traffic shifts and stays on **Green**.
* **Check URL**: Refresh and verify the green frontend displays `Healthy`.

### 2. Simulate Outage & Rollback 🔴
Introduce a failure in `backend/app.js`:
```javascript
app.get('/api/health', (req, res) => {
  return res.status(500).json({ status: 'error', version: VERSION });
});
```
* **Git push**: Trigger the pipeline. Jenkins builds and deploys this broken version.
* **Observe**: The health check fails (`500`). Jenkins immediately rolls selectors back to **Blue** in <100ms. Refresh the browser; users experience **zero downtime**.
* **Visuals**: Show the red error spike on your Grafana dashboard.

### 3. Deploy the Hotfix 🟢
Revert the backend change in `backend/app.js` to return `200 OK`:
```javascript
app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', version: VERSION });
});
```
* **Git push**: Trigger the pipeline. Jenkins validates the hotfix, and traffic successfully stays on **Green**.

