
# Juno 🚀 – Project Management App  

**Juno** is a Project Management web application. It enables users to create projects, manage tasks, assign them to team members, and collaborate seamlessly within teams.

Juno provides great visualisation for users to track and handle their tasks efficiently.

---

## 🌐 Live Demo

[🚀 Deployed Link](https://main.d7m56ktijbm4w.amplifyapp.com/) -- (Currently not available)

---

## 🌟 Features  
- **Project Management**: Create and manage multiple projects.  
- **Task Management**: Add, assign, and track tasks within projects.  
- **Team Collaboration**: Create teams to work on projects together.
- **Authentication & Security**: Secure sign-up and login via **AWS Cognito**.  
- **Cloud-Native Deployment**: Fully hosted and managed on AWS infrastructure.  

---

## 🛠 Tech Stack  

### Frontend  
- [Next.js](https://nextjs.org/) – React framework for production-ready apps  
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) – Data fetching and caching 
- [TypeScript](https://www.typescriptlang.org/) – Type-safe development  

### Backend  
- [Django](https://www.djangoproject.com/) – Robust Backend framework
- [Django Rest Framework (DRF)](https://www.django-rest-framework.org/) – API development  

### Database  
- [PostgreSQL](https://www.postgresql.org/) – Relational database for structured data  

### Authentication  
- [AWS Cognito](https://aws.amazon.com/cognito/) – Secure authentication and authorization  

### Cloud & Deployment (AWS)  
- **EC2** – Hosting backend services  
- **RDS (PostgreSQL)** – Managed relational database  
- **Amplify** – Frontend hosting and CI/CD pipeline  
- **API Gateway** – Connecting frontend and backend services  
- **Lambda** – Serverless functions for special business logic  
- **VPN Setup** – Secure access for backend and database  

---

## 🚀 Getting Started  

Follow these steps to set up the project locally:  

### 1. Clone the Repository
git clone https://github.com/rachelyr/Juno.git
cd juno

### 2. Frontend Setup
#### Navigate to frontend folder:
cd client
npm install
npm run dev

### 3. Backend Setup
### Navigate to backend folder
cd server

### Create a virtual environment
python -m venv venv

### Activate the environment
#### On Mac/Linux:
source venv/bin/activate
#### On Windows:
venv\Scripts\activate

#### Install dependencies:
pip install -r requirements.txt

#### Run database migrations:
python manage.py migrate

#### Start the backend server:
python manage.py runserver

## 📧 Contact
For any suggestions please feel free to connect with me -

Made with 💙 by **[Rachel Yorke]**  
📫 rachel.yorke225@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/rachel-yorke-0a1814254) | [GitHub](https://github.com/rachelyr)

---
