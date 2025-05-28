
# ShoppingGuru

## Description

ShoppingGuru is a price comparison and shopping list management app that allows users to:  
- View banners, stores, and products categorized for easy navigation.  
- Add products to a shopping list and compare prices across different stores.  
- Purchase products from the store offering the **lowest price**.  

### The Project Involves Two Sides:
1. **Admin Side:**  
   - Add, edit, and manage banners, categories, products, stores, and deals.  
2. **App Side:**  
   - Browse category-based products.  
   - Add products to the shopping list.  
   - Compare product prices and purchase from the store with the lowest price.

---

## Prerequisites
Before starting the project, ensure you have the following installed:  
- **Node.js:** Version `v18.19.0` or higher  
- **MongoDB:** Database for storing application data  

---

## Installation

### 1. Clone the Repository
```bash
git clone https://gitlab.com/phpnode/shoppingguru.git
```

### 2. Move into the Project Directory
```bash
cd shoppingguru

```

### 3. Install Dependencies
```bash
npm install
```

---

## Configuration

### Create a `.env` File
Add the following configuration to your `.env` file:  

```plaintext
PORT=
MONGODB_URL=
BASE_URL=http:
SECRET_KEY=
PUBLISH_KEY=
```

---

## Run the Project Locally
```bash
npm start
```
Visit [`http://localhost:3000/loginPage`](http://localhost:3000/loginPage) in your browser to access the application.

---

## Contribution Guidelines

### 1. Fork the Repository
Create a personal copy of the repository by clicking the **"Fork"** button on the GitHub/GitLab page.

### 2. Clone Your Fork
```bash
git clone https://gitlab.com/phpnode/shoppingguru.git
```

### 3. Create a New Branch
It's recommended to create a new branch for your changes rather than working directly on the `main` or `master` branch.
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes
Add new features, fix bugs, or improve the codebase as needed.

### 5. Stage and Commit Changes
```bash
git add .
git commit -m "Add: Meaningful commit message"
```

### 6. Push Your Changes
```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request
Submit a pull request to merge your changes into the main repository.

---

## API Endpoints
| Method | Endpoint          | Description                   |
|--------|-------------------|-------------------------------|
| GET    | /api/products      | Get list of products          |
| GET    | /api/stores        | Get list of stores            |
| POST   | /api/addProduct    | Add a new product             |
| PUT    | /api/editProduct   | Edit an existing product      |
| DELETE | /api/deleteProduct | Delete a product              |

---

## Folder Structure
```
/shoppingguru
├── /src
│   ├── /controllers
│   ├── /models
│   ├── /routes
│   ├── /views
│   ├── /public
│   └── app.js
├── /config
└── /node_modules
```

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.