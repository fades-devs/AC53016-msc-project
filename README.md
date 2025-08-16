# Module Enhancement Review System

Full-stack web application designed to streamline the annual module enhancement review process for the university. This system replaces a manual, multi-platform workflow with a centralized and user-friendly interface for submitting, tracking, and analyzing module reviews.

---

## 🚀 Tech Stack

* **Frontend:** React (Vite), Material-UI (MUI), Axios, Recharts
* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Email Service:** SendGrid (Third-Party)

---

## 🏁 Getting Started

This is a step-by-step guide to run the application on your local machine for development and testing purposes.

### Prerequisites

You must have the following software installed on your computer:
* [Node.js](https://nodejs.org/) (v18 or newer)
* [Git](https://git-scm.com/)
* A code editor, such as [Visual Studio Code](https://code.visualstudio.com/)

### Installation and Setup

The project uses a monorepo structure with separate `frontend` and `backend` directories. The database is hosted on MongoDB Atlas, so no local database installation is required.

**1. Clone the Repository**

Open your terminal or Git Bash and clone the repository to your local machine:
```bash
git clone https://github.com/fades-devs/AC53016-msc-project.git
cd AC53016-msc-project
```

**2. Configure Backend Environment Variables**

The backend server requires environment variables to function.
* Navigate to the backend directory: ```cd backend ```
* Create a new file named .env
* Copy the content below and paste it into your new .env file.
```bash
MONGO_URI=mongodb+srv://fadesdevs:brzmRRlcpJ9ISmXd@cluster0.wwu2sdo.mongodb.net/module-review?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
SENDER_EMAIL=YOUR_SENDER_EMAIL@example.com
```
⚠️ Important: Do not commit the .env file to Git. The repository's .gitignore file is already configured to prevent this.


**3. Install Backend Dependencies**

In your terminal, inside the backend directory, run:
```bash
npm install
```

**4. Install Frontend Dependencies**
In your terminal, inside the frontend directory, run:
```bash
npm install
```

### Running the Application

To run the application, you need to have both the backend and frontend servers running in their separate terminal windows.

**1. Start the Backend Server**

In your backend terminal, run:
```bash
npm run dev
```

You should see a confirmation message in the console:
```
Server is running on port 5000
MongoDB Connected...
```

**2. Start the Frontend Server**

In your frontend terminal, run:
```bash
npm run dev
```

This will automatically open a new tab in your web browser and navigate to ``` http://localhost:5173 ```.
