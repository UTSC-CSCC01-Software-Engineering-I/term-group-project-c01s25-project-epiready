# 🚀 Deployment Process Documentation

This document outlines the CI/CD deployment pipeline for the application, including how testing, Docker image management, deployment to the virtual machine (VM), and post-deployment checks are handled.

---

## 📦 Pre-Deployment Steps (CI)

### 1. **Linting and Unit Tests**

All code changes undergo automated testing using GitHub Actions:

### **Frontend**
---

**Filename**: lint.yml

  * **Linter:** Runs using ESLint.
  * **Unit Tests:** Run using **Jest**.

### **Backend**
---

**Filename**: backend-lint.yml

  * **Linter:** Runs using flake8
  * **Unit Tests:** Run using **pytest**.

### 2. **Build and Push Docker Images**

Triggered only when a Git **tag is pushed** (e.g., `v1.0.0`).

* **Frontend Image:**

  * Dockerfile in `epiready-frontend/`
  * Built and tagged as `epiready-frontend:<git-tag>`

* **Backend Image:**

  * Dockerfile in `epiready-backend/`
  * Built and tagged as `epiready-backend:<git-tag>`

* **Push:** Images are pushed to DockerHub using GitHub Actions.

---

## ☁️ Deployment to VM (CD)

### **Triggering Deployment Workflow**

A **workflow file** (`deploy-docker.yml`) is triggered and sleeps for 2 minutes giving enought time for other files to push image. This only runs when the other workflow files are run in the main branch, not before it.

### 1. **SSH Into VM**

* The workflow file then uses appleboy/ssh-action@v1 to ssh into the Lightsail VM and then goes to the epiready directory where it uses git pull to update the docker-compose file in case any new containers or modifications were made.

### 2. **Pull Docker Images**

* Uses Docker to pull:

  * `your-dockerhub/frontend:<git-tag>`
  * `your-dockerhub/backend:<git-tag>`

### 3. **Deploy Using Docker Compose**

* Uses a `docker-compose.yml` file that defines:

  * **Frontend container** (served via **NGINX**) with **Certbot** for HTTPS
  * **Backend container**
  * **PostgreSQL** service with a **named volume** for persistent storage

* Executes: `docker compose pull && docker compose up -d`

---

## 🔍 Post-Deployment Testing

### 7. **E2E Testing with Cypress**

* Cypress tests are triggered **after deployment completes**.
* Run against the live application to simulate real-user flows.

### 8. **Load Testing with Apache Bench (ab)**

* Conducted to verify server performance and concurrency handling.
* Example: `ab -n 100 -c 10 https://epiready.taggit.tech/`



## 🗂️ Versioning

* **Git Tags** (e.g., `v1.0.1`) determine image versions.
* Helps maintain rollback strategy and historical traceability.

---

## 🔐 Secrets and Security

* SSH keys and DockerHub credentials are stored securely in **GitHub Secrets**.
* Certbot is used to auto-renew SSL certificates for production.



## 📁 Folder Structure (Simplified)

```
epiready/
├── backend/
│   └── Dockerfile
├── frontend/
│   └── Dockerfile
├── docker-compose.yml
├── .github/
│   ├── workflows/
│   │   ├── backend-lint.yml (backend tests)
│   │   └── lint.yml (frontend tests)
│   │   └── docker-deploy.yml (ssh + pull + deploy + post-tests)
│   │   └── build-backend.yml (build and push backend)
│   │   └── build-frontend.yml (build and push frontend)
```

---

## ✅ Summary Checklist

  [x] Run lint and unit tests
  [x] Build & push tagged Docker images
  [x] SSH into VM and deploy with docker-compose
  [x] Serve with NGINX + Certbot
  [x] PostgreSQL with volume
  [x] Run Cypress tests
  [x] Run Apache Bench

---

## 🔄 Future Enhancements (Optional)

* Add rollback automation on test failure
* Add Slack/Discord notifications post-deploy
* Enable blue-green deployments for zero downtime
