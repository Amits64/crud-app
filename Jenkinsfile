@Library('shared-pipeline-lib') _

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
        tag = "${params.IMAGE_TAG}"  // Use IMAGE_TAG parameter
        kubeConfigPath = "/etc/kubernetes/${params.ENVIRONMENT}/config" // Adjusted for dynamic environment
    }

    stages {
        stage('Deploying Container to Kubernetes') {
            steps {
                script {
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
