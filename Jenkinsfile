pipeline {
    agent any

    environment {
        registry = 'amits64'
        registryCredential = 'dockerhub'
        image = 'crud-app'
        tag = "${env.TAG}"
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branches: 'crud-app-v2' url: 'https://github.com/Amits64/crud-app.git'
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
