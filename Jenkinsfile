pipeline {
    agent any

    parameters {
        choice(name: 'NAMESPACE', choices: ['cde', 'ncde'], description: 'Select Namespace')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'qa', 'prod'], description: 'Select the deployment environment')
        string(name: 'IMAGE_TAG', defaultValue: '', description: 'Docker image tag')
    }

    environment {
        registry = 'amits64'
        registryCredential = 'dockerhub'
        image = 'crud-app'
        tag = "v${env.BUILD_NUMBER}"  // Use the Jenkins build number
        kubeConfigPath = "~/.kube/${params.ENVIRONMENT}/config" // Adjusted for dynamic environment
    }

    stages {
        stage('Verify Kubernetes Config') {
            steps {
                script {
                    // Debug steps to verify the Kubernetes configuration file
                    sh "ls -la ~/.kube/${params.ENVIRONMENT}"
                    sh "cat ~/.kube/${params.ENVIRONMENT}/config"
                }
            }
        }

        stage('Deploying Container to Kubernetes') {
            steps {
                script {
                    dir('crud-app') {
                        sh 'helm version'

                        def releaseExists = sh(returnStatus: true, script: "helm ls --kubeconfig ${kubeConfigPath} | grep -q ${image}") == 0

                        if (releaseExists) {
                            echo "Existing Helm release found. Deleting release: ${image}"
                            sh "helm delete ${image} --kubeconfig ${kubeConfigPath}"
                        } else {
                            echo "No existing Helm release found for ${image}. Proceeding with installation."
                        }

                        sh """
                        helm upgrade --install ${image} ./ \
                        --kubeconfig ${kubeConfigPath} \
                        --set appimage=${registry}/${image}:${tag} \
                        --namespace ${params.NAMESPACE}
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (currentBuild.result != 'SUCCESS') {
                    error("Container deployment failed!")
                } else {
                    echo "Container deployment succeeded!"
                }
            }
        }
    }
}
