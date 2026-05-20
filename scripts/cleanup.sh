#!/bin/bash
# Cleanup script - removes old pods/services from previous projects

echo "=== Cleaning up old resources from default namespace ==="

# Delete old deployments
kubectl delete deployment blue-deployment green-deployment blue-green-manager dashboard grafana prometheus jenkins -n default 2>/dev/null
echo "Old deployments deleted."

# Delete old services (keep 'kubernetes' and monitoring ones)
kubectl delete svc todo-service dashboard-service manager-service jenkins-service -n default 2>/dev/null
echo "Old services deleted."

# Delete old configmaps (except prometheus-config which we use)
echo "Kept prometheus-config."

# Clean up blue-green-demo namespace entirely (fresh start)
echo ""
echo "=== Resetting blue-green-demo namespace ==="
kubectl delete deployment --all -n blue-green-demo 2>/dev/null
kubectl delete svc --all -n blue-green-demo 2>/dev/null
echo "blue-green-demo namespace cleaned."

echo ""
echo "=== Cleanup complete! Run 'Build Now' in Jenkins to redeploy fresh. ==="
