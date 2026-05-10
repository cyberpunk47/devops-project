#!/bin/bash
# ──────────────────────────────────────────────────────────────
# deploy.sh — One-shot script to deploy the full stack on Minikube
# ──────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }

# ─── 1. Check prerequisites ────────────────────────────────
for cmd in minikube kubectl docker; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "❌ Required tool '$cmd' not found. Please install it."
        exit 1
    fi
done

# ─── 2. Start minikube if not running ──────────────────────
if ! minikube status | grep -q "Running"; then
    info "Starting minikube..."
    minikube start --driver=docker
fi

# ─── 3. Point Docker to Minikube's daemon ──────────────────
info "Switching to Minikube's Docker daemon..."
eval $(minikube docker-env)

# ─── 4. Build images inside Minikube ───────────────────────
info "Building backend image..."
docker build -t tasks-backend:latest ./backend

info "Building frontend image..."
(cd frontend && npm ci && npm run build)
docker build -t tasks-frontend:latest ./frontend

# ─── 5. Apply K8s manifests ────────────────────────────────
info "Deploying to Kubernetes..."
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/grafana-deployment.yaml

# ─── 6. Wait for pods ─────────────────────────────────────
info "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app=backend    --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend   --timeout=120s
kubectl wait --for=condition=ready pod -l app=prometheus  --timeout=120s
kubectl wait --for=condition=ready pod -l app=grafana     --timeout=120s

# ─── 7. Print access info ─────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
info "🎉 All services deployed!"
echo ""
echo "  Frontend:   $(minikube service frontend --url 2>/dev/null || echo 'kubectl port-forward svc/frontend 3000:80')"
echo "  Backend:    kubectl port-forward svc/backend 8000:8000"
echo "  Prometheus: $(minikube service prometheus --url 2>/dev/null || echo 'kubectl port-forward svc/prometheus 9090:9090')"
echo "  Grafana:    $(minikube service grafana --url 2>/dev/null || echo 'kubectl port-forward svc/grafana 3001:3000')"
echo "              Login: admin / admin"
echo ""
echo "════════════════════════════════════════════════════════"
