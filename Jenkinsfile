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
        
        stage('Prepare Helm Chart') {
            steps {
                script {
                    def chartDirectory = 'crud-app'  // Path to your Helm chart directory

                    // Log the directory structure to ensure it's correct
                    sh "ls -R ${chartDirectory}"

                    // Log the contents of the Chart.yaml file
                    sh "cat ${chartDirectory}/Chart.yaml"
                }
            }
        }
        
        stage('Deploying Container to Kubernetes') {
            steps {
                script {
                    def chartDirectory = 'crud-app'  // Path to your Helm chart directory

                    // Check if Helm release already exists
                    def releaseExists = sh(returnStatus: true, script: "helm ls -q | grep -w ${image}") == 0
                    if (releaseExists) {
                        // Delete the existing Helm release if it exists
                        sh "helm delete ${image}"
                    }

                    // Deploy the new Docker image to Kubernetes using Helm
                    sh "helm install ${image} ${chartDirectory} --set image.repository=${registry}/${image} --set image.tag=${tag} --set-file ca.crt=/etc/ca-certificates/update.d/jks-keystore"
                }
            }
        }
    }
}
