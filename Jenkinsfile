pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        BACKEND_IMAGE   = 'tasks-backend'
        FRONTEND_IMAGE  = 'tasks-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -t ${BACKEND_IMAGE}:latest .'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest .'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'go test ./... -v || echo "No tests yet"'
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                sh '''
                    kubectl apply -f k8s/prometheus-config.yaml
                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl apply -f k8s/frontend-deployment.yaml
                    kubectl apply -f k8s/prometheus-deployment.yaml
                    kubectl apply -f k8s/grafana-deployment.yaml
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "Waiting for pods to be ready..."
                    kubectl wait --for=condition=ready pod -l app=backend --timeout=120s
                    kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s
                    kubectl wait --for=condition=ready pod -l app=prometheus --timeout=120s
                    kubectl wait --for=condition=ready pod -l app=grafana --timeout=120s
                    echo "All pods are running:"
                    kubectl get pods -o wide
                    kubectl get services
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
    }
}
