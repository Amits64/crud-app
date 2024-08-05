@Library('shared-pipeline-lib') _

pipeline {
    agent any

    environment {
        registry = 'amits64'
        registryCredential = 'dockerhub'
        image = 'crud-app'
        tag = "v${BUILD_NUMBER}"
        sonarHostUrl = 'http://192.168.2.20:9000/'
        repoUrl = 'https://github.com/Amits64/crud-app.git' // Add your repository URL here
    }

    stages {
        stage('CI') {
            steps {
                // Call the shared library function for CI
                ciPipeline(
                    registry: registry,
                    registryCredential: registryCredential,
                    image: image,
                    tag: tag,
                    sonarHostUrl: sonarHostUrl,
                    repoUrl: repoUrl
                )
            }
        }

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
                if (currentBuild.result != 'SUCCESS') {
                    error("Container deployment failed!")
                }
            }
        }
    }
}
