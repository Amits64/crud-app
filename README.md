# Node.js REST API with Docker, Kubernetes, Prometheus, and Grafana
This project demonstrates how to build and deploy a Node.js-based RESTful API using Docker and Kubernetes. Additionally, it showcases how to monitor and alert using Prometheus and Grafana.

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

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port your application is running on
EXPOSE 3000

# Define the command to start your Node.js application
CMD [ "node", "app.js" ]
Building and tagging and pushing the image to Dockerhub
Now build, tag and push the Docker image form the Dockerfile using the following command:

Docker build -t iamsauravsingh/crudapp .
Docker push iamsauravsingh/crudapp
Deploy the Image to Kubernetes
In this project we are deploying our manifest file using helm. Run the following command to deploy using helm:

helm create crud .
Write the manifest file for the application and place it to crud/template directory. Then run the following command

helm install crudapp crud
This will deploy the application on kubernetes cluster.

Setting up the Prometheus and Grafana
To install prometheus and Grafana you need to run the following command

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install my-kube-prometheus-stack prometheus-community/kube-prometheus-stack --version 51.4.0
We are using kube-prometheus-stack because it comes with prometheus all the dependencies which we need to install.

Now edit the service in using kubectl edit svc command and expose the grafana service.

Login to Grafana and go to Home > Dashboards > Kubernetes/ComputeResources/Pod and select the pods which we have deployed it looks like this: Dashboard Dashboard
