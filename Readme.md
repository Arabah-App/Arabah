
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
PORT= 7000
MONGODB_URL= mongodb://[username:password@]host[:port][/[database][?options]]
BASE_URL=http:mongodb://[username:password@]host[:port][/[database][?options]]
SECRET_KEY= 2bfdb993sdsasdas89a53941f85307af2ea2651a6cwewe97ee33cef1bf69108487577ff9cee70016c0
PUBLISH_KEY= 911a408834asdwewrewrewrvxcvcab595756ad4244ewewewed51fc0e227a657d9b41832986f192030a78cec69
```

---

<!-- Technologies Used -->
## Technologies Used

* [EJS for Admin Panel](https://ejs.co/)
* [NodeJS (v18.22.4) for Backend](https://nodejs.org/)
* [MongoDB(v3.6.3)](https://www.mongodb.com/)




## USE  Dependencies Name and version

```sh
 "dependencies"
   "apn": "^2.2.0",
    "axios": "^1.9.0",
    "bcrypt": "^5.1.1",
    "canvas": "^3.1.0",
    "compression": "^1.8.0",
    "cookie-parser": "~1.4.4",
    "csv-parser": "^3.1.0",
    "dotenv": "^16.3.1",
    "ejs": "~2.6.1",
    "exceljs": "^4.4.0",
    "express": "~4.16.1",
    "express-fileupload": "^1.4.1",
    "express-flash": "^0.0.2",
    "express-rate-limit": "^7.5.0",
    "express-session": "^1.17.3",
    "fcm-node": "^1.6.1",
    "helmet": "^8.1.0",
    "http-errors": "~1.6.3",
    "https": "^1.0.0",
    "ioredis": "^5.5.0",
    "joi": "^17.12.3",
    "jsbarcode": "^3.11.6",
    "json5": "^2.2.3",
    "jsonwebtoken": "^9.0.2",
    "langdetect": "^0.2.1",
    "mongo-sanitize": "^1.1.0",
    "mongoose": "^7.6.3",
    "morgan": "~1.9.1",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "node-input-validator": "^4.5.1",
    "nodemailer": "^6.9.7",
    "nodemon": "^3.0.1",
    "qrcode": "^1.5.4",
    "referral-code-generator": "^1.0.8",
    "socket.io": "^4.8.1",
    "sweetalert2": "^11.15.10",
    "translate-google": "^1.5.0",
    "uninstall": "^0.0.0",
    "uuid": "^9.0.1",
    "uuidv4": "^6.2.13",
    "validator": "^13.11.0",
    "xlsx": "^0.18.5"
  ```



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


## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| *Utility/sanitizeInputs* | Manage all dynamic header keys with callback functions in this folder. and a mange body and query data sanitizeInputs   |
| *node_modules*         | Contains all  npm dependencies    |
| *views*                  | Contains  source code that will be compiled to the views dir    |
| *configuration*        | Application configuration including environment-specific configs 
| *controllers*           | Controllers define functions to serve various express routes. 
| *views/common*              | Common libraries to be used across your app.  
| *Utility*      | Express middlewares which process the incoming requests before handling them down to the routes
| *routes*           | Contain all express routes, separated by module/area of application                       
| *Model*           | Models define schemas that will be used in storing and retrieving data from Application database  |
| *helper*      | The use of helper like some call back function This function retrun a data for a small time  |
| **src**/ShoppingGuru.js         | Entry point to express app                                                               |
| package.json             | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)   | tsconfig.json            | Config settings for compiling source code only written in TypeScript    
| Socket             | Use of socket Like Product_Comment modules on a real time manage respones       


## Postman collection 

| Folder Name And File Name |
| ------------------------ | 
|  ShopingGuru/ShopingGuru.postman_collection| 

 |*  All APIs work on both Live and Local environments.*|

|* Dynamic header keys are managed for each request.*|

|* Login, Signup, and CMS APIs can be called without a user token in the header.*|

|* All other APIs require a user token in the request header.*|

|* To call any API, both secret_key and publish_key are required.*|

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.