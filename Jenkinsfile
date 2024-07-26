pipeline {
    agent any

    environment {
        registry = 'amits64'
        registryCredential = 'dockerhub'
        image = 'crud-app'
        tag = "${env.TIMESTAMP}"  // Use TIMESTAMP environment variable
    }

    stages {
        stage('Git Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Static Code Analysis') {
            steps {
                script {
                    def sonarScannerImage = 'sonarsource/sonar-scanner-cli:latest'
                    docker.image(sonarScannerImage).inside() {
                        withSonarQubeEnv('sonarqube') {
                            sh """
                            sonar-scanner \
                            -Dsonar.host.url=http://192.168.10.10:9000/ \
                            -Dsonar.projectKey="${image}" \
                            -Dsonar.exclusions=**/*.java
                            """
                        }
                    }
                }
            }
        }

        stage('Selenium Testing') {
            steps {
                script {
                    dir('selenium-project') {
                        sh 'mvn clean test'
                    }    
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image with the TIMESTAMP tag
                    docker.build("${registry}/${image}:${tag}", "-f Dockerfile .")
                }
            }
        }
        
        stage('Deploying Container to Kubernetes') {
            steps {
                script {
                    // Check if Helm release already exists and delete if necessary
                    def releaseExists = sh(returnStatus: true, script: 'helm ls | grep -q ${image}') == 0
                    if (releaseExists) {
                        sh "helm delete ${image}"
                    }

                    // Deploy the new Docker image to Kubernetes
                    sh "helm install ${image} ./ --set appimage=${registry}/${image}:${tag} --set-file ca.crt=/etc/ca-certificates/update.d/jks-keystore"
                }
            }
        }
    }
}
