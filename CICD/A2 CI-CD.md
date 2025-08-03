# 🧱 CI/CD System Design Document

**Project**: **Epiready**
**Date**: 2025-07-28
**Target Environment**: AWS Lightsail Ubuntu 24.04
**Version**: 1.0


---

## 1. 🔍 Overview

The CI/CD pipeline roughly performs 6 major steps:

* Uses NGINX as reverse proxy to serve website through HTTPS
* Uses PostgreSQL container with named volume to keep data stored in the VM
* Uses docker compose to run the docker containers in an isolated environment
* Uses GitHub Actions for CI/CD automation(tests, building images, deployment)
* Image hosting on DockerHub
* Post-deployment E2E testing with Cypress


---

## 2. Services Used

* **Web Hosting:** AWS Lightsail
* **SSL Cetificate**: Let's Encrypt, Certbot(for renewing and getting SSL certificate from Let's Encrypt)
* **Storing Images**: Dockerhub
* **Reverse Proxy**: NGINX
* **Database**: PostgreSQL
* **e2e Testing**: Cypress
* **CI/CD Automation**: Github Actions
* **Performance Testing**: ApacheBench
* **Container Management**: Docker compose


---

## 3. 🧹 Components

### 3.1 Frontend

* Built using vite build through Dockerfile and pulled from Dockerhub
* Serves static assets via NGINX
* Communicates with backend over HTTPS

### 3.2 Backend

* Exposes RESTful API (HTTPS only)
* Connects to PostgreSQL database
* Secured via environment variables and CORS policies

**Dependecies:** PostgreSQL

### 3.3 Database

* PostgreSQL 14 (Docker)
* Persistent volume for no data loss between deployments

### 3.4 NGINX

* Acts as reverse proxy
* Handles HTTPS using Let's Encrypt or self-managed certs

**Dependencies:** Frontend, Backend


---

## 4. 🔒 Security

* All secrets (SSH key, DockerHub credentials) stored in GitHub Secrets
* HTTPS enforced via NGINX with certbot and Let's Encrypt
* CSRF & CORS handled by backend
* No direct ports exposed
* All the keys for backend are stored in the epiready-backend/.env file in the vm for adding multiple keys easily
* Using Github Secrets for injecting the frontend secrets at build time


---

## 5. 🧚️‍♂️ Testing Strategy

All the tests are run via Github Actions, post-deployment tests are run after ssh-ing into the vm and then running tests.

* **Lint Tests**: Checks basic syntax using a linter to ensure the website doesn't have any breaking issues.
* **Unit Tests**: Using Jest for frontend and Pytest for backend and running the tests on Pull Requests and Push to make sure no uncaught bugs are pushed into prod.
* **End-to-End Tests**: End to end tests done via Cypress after the website is deployed to test functionality.
* **Performance Tests**: Runs ApacheBench to do a basic load testing to test responsiveness of the website.


---

## 6. 🚀 Architecture Diagram

<img width="530" height="420" alt="image" src="https://github.com/user-attachments/assets/3aeab0e5-1e6f-447d-a311-300f10e4b4f9" />


---

## 7. Deployment Strategy

Using Recreate deployment pattern for deployment giving around 10 seconds of downtime per release. Recreate Deployment is used for cost and performance efficiency as  two containers deplete the resources of the VM.


---

## 8. Performance

Serving static files for more responsive frontend and doing basic performance testing, the deployment is able to handle 100 concurrent requests within 75 ms.


---

## 9. 📌 Future Improvements

* Adding more containers and load balancer for horizontal scaling
* Add alerting with Slack/email on deploy failure
* Blue-green deployment for lower downtime
* DB backup container & monitoring tools


---


