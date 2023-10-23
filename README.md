# Node.js REST API with Docker, Kubernetes, Prometheus, and Grafana
This project demonstrates how to build and deploy a Node.js-based RESTful API using Docker and Kubernetes. Additionally, it showcases how to monitor and alert using Prometheus and Grafana along with Code Quality using SonarQube.

# Prerequisites
Before you get started, ensure you have the following installed:

* Node.js and npm
* Docker
* Kubernetes cluster (e.g., Minikube, Docker Desktop, or a cloud-based solution)
* Prometheus and Grafana set up in your Kubernetes cluster

# Getting Started
Run the following command to start the project:

  ```bash
  mkdir crud-app
  cd crud-app
  npm init -y
  ```
This command will initialize a node.js project in your directory and you have package.json file.

Installing dependencies
For this project we need to install dependencies like express.js and prom-client. To install the dependencies run the following command:

npm i express prom-client
Creating configuration file and testing configuration locally
We need a configuration file and we need to create index.js file and write the configurations and Run the node index.js to test the application whether it is working properly or not.
Go the the browser and search this address localhost:3000/metrics and you will see something like this:

metrics

For more results check the Screenshots Directory.

Containerizing the application
Create a Dockerfile and put the following configuration:

    # Use an official Node.js runtime as the base image
    FROM node:14
    
    # Create a non-root user and group for running the application
    RUN groupadd -g 1001 nonroot && useradd -u 1001 -g nonroot -m nonroot
    
    # Create a directory for your app and set it as the working directory
    WORKDIR /usr/src/app
    
    # Copy specific files and directories required for the image to run
    COPY package.json .
    COPY package-lock.json .
    COPY index.js .
    
    # Install app dependencies as the non-root user
    RUN npm install
    
    # Expose the port your app will run on
    EXPOSE 3000
    
    # Switch to the non-root user for running the application
    USER nonroot
    
    # Define the command to run your Node.js application
    CMD ["node", "index.js"]

# Building and tagging and pushing the image to Dockerhub
Use below commands to build a docker image

    docker build -t amits64/crud-app .
    docker push amits64/crud-app

# Deploy the Image to Kubernetes
In this project we are deploying our manifest file using helm. Run the following command to deploy using helm:

    helm create crud-app

Write the manifest file for the application and place it to `crud-app/template` directory. Then run the following command
    
    helm install crud-app crud-app

This will deploy the application on kubernetes cluster.

# Setting up the Prometheus and Grafana
To install prometheus and Grafana you need to run the following command

    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install my-kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 51.4.0

We are using kube-prometheus-stack because it comes with prometheus all the dependencies which we need to install.

Now edit the service in using `kubectl edit svc` command and expose the grafana service and crud-app as "LoadBalancer" as shown in below image:

![image](https://github.com/Amits64/crud-app/assets/135766785/f695215e-3685-47df-9882-9580d394de29)

`Login to Grafana and navigate to the Home > select Dashboards > select your Pod template` to display we have deployed it looks like this:

![image](https://github.com/Amits64/crud-app/assets/135766785/b7fc793f-25a9-4848-bec3-fc7e6b0a9699)

# Selenium Testing
This project also includes Selenium testing using Mocha to ensure the functionality of your Node.js application. To run the tests, follow the command in the project's root directory:

    npx mocha selenium-project/src/test/java/com/selenium/selenium-test.js

# Screenshots:

![Screenshot](https://github.com/Amits64/crud-app/assets/135766785/75198580-5af7-4861-a34b-0f6ec176bb6c)

![scrapMetrics](https://github.com/Amits64/crud-app/assets/135766785/1b2601cd-bfbc-4a0f-a60a-1d1734ae604a)


# Contributing
Feel free to contribute to this project. Fork the repository, make your changes, and submit a pull request.
