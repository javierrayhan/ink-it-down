![inkitdown-logo](template/assets/logo.svg)

# Project Documentation: Ink It Down

---

### Overview

**Ink It Down** is a web-based application designed to provide concise and direct responses to user queries. It utilizes a backend API to process prompts and generate relevant answers.

---

### Project Structure

* **Frontend**: Built with HTML, CSS, and JavaScript.
* **Backend**: Developed using Flask, serving as the API endpoint.
* **Hosting**: Deployed on Vercel for both frontend and backend services.

---

### Core Features

* **Prompt Submission**: Users can input prompts via the frontend interface.
* **API Interaction**: The frontend communicates with the backend API to process prompts.
* **Response Handling**: The backend returns concise answers, which are then displayed to the user.

---

### CORS Configuration

To enable seamless communication between the frontend and backend, Cross-Origin Resource Sharing (CORS) is configured in the Flask application:

```python
from flask_cors import CORS

CORS(app, 
     resources={r"/api/*": {
         "origins": "*",
         "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
         "allow_headers": ["Content-Type", "Authorization", "X-API-Token"],
         "expose_headers": ["Content-Type"]
     }}, 
     supports_credentials=True)
```

This configuration allows all origins to access the API endpoints, facilitating development and testing across different environments.

---

### Deployment

* **Frontend**: Hosted on Vercel, link: [Vercel Backend Deploy](https://ink-it-downbackendflask.vercel.app/)
* **Backend**: Also deployed on Vercel, ensuring both services are on the same platform for optimal performance. Link: (InkItDown)[https://inkitdown.javierrayhan.my.id]

---

### Usage

1. **Access the Application**: Navigate to the provided frontend URL.
2. **Input Prompt**: Enter a query into the prompt field.
3. **Receive Response**: The backend processes the prompt and returns a concise answer.

---

### License

This project is licensed under the MIT License.

---

For more details, visit the [GitHub Repository](https://github.com/javierrayhan/ink-it-down).
