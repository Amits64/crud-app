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
                    def sonarScannerImage = 'sonarsource/sonar-scanner-cli:latest'
                    docker.image(sonarScannerImage).inside() {
                        withSonarQubeEnv('SonarQube') {
                            sh """
                            sonar-scanner \
                            -Dsonar.host.url=http://192.168.101.2:9000/ \
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
                    docker.build("${registry}/${image}:${tag}", "-f Dockerfile .")
                }
            }
        }
        
        // Other stages follow similarly with corrected indentation...

        stage('Deploying Container to Kubernetes') {
            steps {
                script {
                    dir('crud-app') {
                        def releaseExists = sh(returnStatus: true, script: 'helm ls | grep -q ${image}') == 0
                        if (releaseExists) {
                            sh 'helm delete ${image}'
                        }

                        sh "helm install ${image} ./ --set appimage=${registry}/${image}:${tag} --set-file ca.crt=/etc/ca-certificates/update.d/jks-keystore"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def testResults = currentBuild.resultIsBetterOrEqualTo('SUCCESS') ? 0 : 1
                if (testResults != 0) {
                    error("Selenium tests failed!")
                }
            }
        }
    }
}
