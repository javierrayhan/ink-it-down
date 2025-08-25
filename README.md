![inkitdown-logo](template/assets/logo.svg)

# Project Documentation: Ink It Down

---

### Overview

**Ink It Down** is a Markdown editor with basic templates and IBM Granite AI integration. The AI assists in generating Markdown documents quickly and efficiently.

---

### Project Structure

* **Frontend**: Built with HTML, CSS, and JavaScript.
* **Backend**: Developed using Flask, serving as the API endpoint.
* **Hosting**: Deployed on Vercel for both frontend and backend services.

---

### Core Features

* **Markdown editor with live preview**
* **Basic templates for quick documentation**
* **AI-assisted Markdown generation using IBM Granite**
* **Local fallback if no API key is provided**

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
* **Backend**: Also deployed on Vercel, ensuring both services are on the same platform for optimal performance. Link: [InkItDown](https://inkitdown.javierrayhan.my.id)
  
---

For more details, visit:
[Figma Slide](https://www.figma.com/deck/eHtazBkBecMZiXuZTdYwof/INK-IT-DOWN?node-id=6-165&t=QODVLF5UgiGEzis9-1) or [PDF Online](https://jumpshare.com/share/EDLS807JLYSgCw3Pa9PT).
