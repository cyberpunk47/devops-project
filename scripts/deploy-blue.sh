
eval $(minikube docker-env)

docker build --build-arg VERSION=blue -t devops-proj/frontend:blue ./frontend
# // removing the old one
kubectl rollout restart deployment blue-frontend -n blue-green-demo

kubectl rollout status deployment blue-frontend -n blue-green-demo --timeout=60s

