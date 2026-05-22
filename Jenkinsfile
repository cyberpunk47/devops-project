pipeline {
    agent any
    environment {
        KUBECONFIG    = '/var/lib/jenkins/.kube/config'
        MINIKUBE_HOME = '/var/lib/jenkins'
    }

    stages {
        stage('Prepare & Deploy Blue') {
            steps {
                sh '''
                    cd terraform
                    terraform init
                    terraform apply -auto-approve
                    cd ..

                    eval $(minikube docker-env)
                    
                    # Deplpoying blue as if it is not running
                    if ! kubectl get deployment blue-frontend -n blue-green-demo >/dev/null 2>&1; then
                        echo "Blue not found making the blue one"
                        
                        docker build --build-arg VERSION=blue -t devops-proj/frontend:blue ./frontend
                        docker build --build-arg VERSION=blue -t devops-proj/backend:blue ./backend
                        
                        kubectl apply -f k8s/blue-deployment.yaml
                        kubectl apply -f k8s/service.yaml
                        
                        echo "Waiting for build process to complete"
                        sleep 10
                    else
                        echo "Blue already running"
                    fi
                '''
            }
        }

        stage('Build Green') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh '''
                        eval $(minikube docker-env)
                        
                        echo "Building Green Images"
                        docker build --build-arg VERSION=green -t devops-proj/frontend:green ./frontend
                        docker build --build-arg VERSION=green -t devops-proj/backend:green ./backend
                    '''
                }
                script {
                    if (currentBuild.result == 'FAILURE') {
                        env.ROLLBACK = 'true'
                    }
                }
            }
        }

        stage('Deploy Green') {
            when {
                expression { env.ROLLBACK != 'true' }
            }
            steps {
                sh '''
                    kubectl apply -f k8s/green-deployment.yaml
                    # Switching the traffic from blue to green
                    kubectl patch svc frontend-service -n blue-green-demo \
                      -p '{"spec":{"selector":{"version":"green"}}}'
                    kubectl patch svc backend-service -n blue-green-demo \
                      -p '{"spec":{"selector":{"version":"green"}}}'
                '''
            }
        }

        stage('Health Check') {
            when {
                expression { env.ROLLBACK != 'true' }
            }
            steps {
                script {
                    echo "Waiting for green to start"
                    sleep(12)
                    
                    def MINIKUBE_IP = sh(
                        script: "minikube ip",
                        returnStdout: true
                    ).trim()

                    def STATUS = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://${MINIKUBE_IP}:30080/api/health",
                        returnStdout: true
                    ).trim()

                    echo "Green Deployment Health Check returned HTTP Status Code: ${STATUS}"

                    if (STATUS != '200') {
                        echo "200 req not found (HTTP ${STATUS})! Triggering rollback..."
                        env.ROLLBACK = 'true'
                    } else {
                        echo "Health check passed! Green version is stable."
                    }
                }
            }
        }

        stage('Rollback if Broken') {
            when {
                expression { env.ROLLBACK == 'true' }
            }
            steps {
                echo "Green deployment broken! Rolling back traffic to stable Blue..."
                sh '''
                    kubectl patch svc frontend-service -n blue-green-demo \
                      -p '{"spec":{"selector":{"version":"blue"}}}'
                    kubectl patch svc backend-service -n blue-green-demo \
                      -p '{"spec":{"selector":{"version":"blue"}}}'
                '''
                echo "Rollback completed successfully. Systems restored to Blue."
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed! Rolling back traffic to stable Blue..."
            sh '''
                kubectl patch svc frontend-service -n blue-green-demo \
                  -p '{"spec":{"selector":{"version":"blue"}}}' || true
                kubectl patch svc backend-service -n blue-green-demo \
                  -p '{"spec":{"selector":{"version":"blue"}}}' || true
            '''
            echo "Rollback completed. Systems restored to Blue."
        }
        always {
            echo "Pipeline finished."
        }
    }
}
