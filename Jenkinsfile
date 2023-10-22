pipeline {
    agent any

    environment {
        registry = 'amits64'
        registryCredential = 'dockerhub'
	image = 'crud-app'
        tag = "v${BUILD_NUMBER}"
    }

    stages {
        stage('Git Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    userRemoteConfigs: [[url: 'https://github.com/Amits64/crud-app.git']]
                ])
            }
        }

        stage('Static Code Analysis') {
            steps {
                script {
                    // Execute SonarQube scanner
                    def sonarScannerImage = 'sonarsource/sonar-scanner-cli:latest'
                    docker.image(sonarScannerImage).inside() {
                        withSonarQubeEnv('SonarQube') {
                            sh """
                            sonar-scanner \
                            -Dsonar.host.url=http://192.168.101.7:9000/ \
                            -Dsonar.projectKey="${image}"
                            """
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    docker.build("${registry}/${image}:${tag}", "-f Dockerfile .")
                }
            }
        }

        stage('Upload Image') {
            steps {
                script {
                    // Push the Docker image to the registry
                    docker.withRegistry('', registryCredential) {
                        docker.image("${registry}/${image}:${tag}").push()
                    }
                }
            }
        }

        stage('Remove Unused Docker Image') {
            steps {
                script {
                    sh "docker rmi ${registry}/${image}:${tag}"
                }
            }
        }

        stage('Deploying Container to Kubernetes') {
            steps {
                dir('crud-app') {
                    script {
                        // Check if the release "image" exists
                        def releaseExists = sh(returnStatus: true, script: 'helm ls | grep -q ${image}') == 0
                        if (releaseExists) {
                            // Delete the release
                            sh 'helm delete ${image}'
                        }

                        // Install Helm chart
                        sh "helm install ${image} ./ --set appimage=${registry}/${image}:${tag} --set-file ca.crt=/etc/ca-certificates/update.d/jks-keystore"
                    }
                }
            }
        }
    }
}
