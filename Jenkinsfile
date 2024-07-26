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
                checkout scm  // Checkout the code from SCM (Source Control Management)
            }
        }
        
        stage('Deploying Container to Kubernetes') {
            steps {
                script {
                    // Check if Helm release already exists
                    def releaseExists = sh(returnStatus: true, script: 'helm ls -q | grep -w ${image}') == 0
                    if (releaseExists) {
                        // Delete the existing Helm release if it exists
                        sh "helm delete ${image}"
                    }

                    // Deploy the new Docker image to Kubernetes using Helm
                    sh "helm install ${image} ./ --set image.repository=${registry}/${image} --set image.tag=${tag} --set-file ca.crt=/etc/ca-certificates/update.d/jks-keystore"
                }
            }
        }
    }
}
