# Style Cart

Modern E-Commerce Website — Complete Development Prompt

1. Project Overview

Build a modern, clean, responsive e-commerce website for a small online retail business.

The website should provide a simple shopping experience:

Browse Products → Search/Filter → View Product → Add to Cart → Checkout → Create Order

The design should be inspired by the clean, premium feel of Allbirds, but must be an original design and must not copy its layout, branding, assets, or content.

The application should be production-ready, responsive, maintainable, and optimized for a small product catalog.

2. Recommended Technology Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

React Hook Form

Zod for validation

TanStack Query for API/server-state management

Zustand for cart/client state

Lucide React for icons

Backend

Node.js

Express.js

TypeScript

RESTful API

JWT authentication where required

Zod/Joi validation

Database

Use MongoDB with Mongoose.

AI

Use an LLM API such as OpenAI to automatically generate product tags from:

Product name

Product description

Product category

Example:

Product:
"Men's Outdoor Running Shoes"

Generated tags:

Men

Running

Sports

Footwear

Outdoor

AI responses must be returned in structured JSON and validated before saving.

Deployment

GitHub for source control

Vercel for frontend

Deploy backend/API using a suitable Node.js hosting environment

MongoDB Atlas for database

Environment variables for API keys and secrets

3. Main Website Pages

Page 1 — Home Page

Purpose:
Introduce the store and guide customers toward products.

Sections:

Header/navigation

Hero banner

Featured products

Product categories

Promotional section

Best-selling products

Short brand/about section

Newsletter section

Footer

Main actions:

Shop Now

Browse Products

View Category

View Product

4. Header / Navigation

Create a responsive navigation component used throughout the website.

Include:

Logo

Home

Shop

Categories

Search

Cart

Login/account

Desktop:

Horizontal navigation

Search icon/input

Cart icon with item count

Mobile:

Hamburger menu

Mobile navigation drawer

Search

Cart

The header should remain clean and minimal.

5. Product Catalog Page

Route:

/products

Purpose:

Display all available products.

Features:

Product grid

Product image

Product name

Price

Category

AI-generated tags

Inventory status

Add to cart

View details

Filtering:

Category

Price range

Availability

Tags

Sorting:

Newest

Price low to high

Price high to low

Popular/relevant

Include:

Loading state

Empty state

Error state

Pagination or load more

6. Category Page

Route:

/category/[slug]

Purpose:

Display products belonging to a specific category.

Example:

/category/footwear

Features:

Category title

Category description

Product count

Product grid

Search/filter

Sorting

Pagination/load more

Reuse the same product-card component from the main catalog.

7. Search Page

Route:

/search?q=running

Purpose:

Allow customers to find products quickly.

Features:

Search input

Search results

Product count

Category filtering

Price filtering

Tag filtering

Sorting

Show a useful empty state when no products match.

Example:

"No products found for 'running'. Try another search."

8. Product Details Page

Route:

/products/[slug]

Purpose:

Display complete product information.

Include:

Product image gallery

Product name

Price

Description

Category

AI-generated tags

Inventory status

Quantity selector

Add to cart

Product information

Related products

Important UX:

If inventory is 0:

Disable Add to Cart

Display "Out of Stock"

If inventory is low:

Display "Only X left"

9. Shopping Cart Page

Route:

/cart

Purpose:

Allow customers to review their selected products.

Include:

Product image

Product name

Price

Quantity selector

Remove button

Subtotal

Shipping if applicable

Total

Continue shopping

Checkout button

Cart should persist during navigation.

Use Zustand or another lightweight client-state solution.

10. Checkout Page

Route:

/checkout

Purpose:

Collect customer information and create an order.

Fields:

Full name

Email

Phone

Address

City

State/Region

Postal code

Country

Order summary:

Products

Quantities

Prices

Subtotal

Shipping

Total

Add:

Form validation

Required-field validation

Error messages

Loading state

Prevent duplicate order submission

For the initial MVP, implement a basic order checkout flow rather than building a complex payment system unless payment integration is specifically requested.

11. Order Confirmation Page

Route:

/order-success/[orderId]

Display:

Success message

Order number

Customer name

Ordered products

Total

Order status

Contact information

Continue shopping button

Example:

"Your order has been successfully placed."

12. Authentication

Implement authentication only where required.

Pages:

Login

Register

Account/Profile

Use:

JWT

Secure password hashing

Protected admin routes

Customer authentication can be kept simple for the MVP.

Admin functionality must be protected.

13. Admin Product Management

Route:

/admin/products

Purpose:

Allow administrators to manage the product catalog.

Features:

Product list

Search products

Filter products

Create product

Edit product

Delete product

View inventory

Generate AI tags

Product table should display:

Image

Name

Category

Price

Inventory

Tags

Status

Actions

14. Admin Create/Edit Product

Route:

/admin/products/new

and

/admin/products/[id]/edit

Fields:

Product name

Slug

Description

Price

Category

Images

Inventory

Status

Actions:

Save product

Update product

Delete product

Generate AI tags

AI tagging button:

"Generate Tags with AI"

The generated tags should be displayed before saving so the admin can review them.

15. AI Product Tagging

Create an API endpoint:

POST /api/products/:id/generate-tags

Process:

Get product information.

Send product name, description, and category to the AI API.

Ask the AI to generate relevant product tags.

Return structured JSON.

Validate the response.

Save tags to the database.

Display tags in the admin interface.

Example AI output:

{
  "tags": [
    "Running",
    "Sports",
    "Footwear",
    "Outdoor",
    "Men"
  ]
}


Do not allow arbitrary AI output to directly modify the database without validation.

The AI integration should be simple, reliable, and cost-conscious.

16. Database Models

User

Fields:

name

email

passwordHash

role

createdAt

updatedAt

Roles:

customer

admin

Product

Fields:

name

slug

description

price

images

category

tags

inventory

status

createdAt

updatedAt

Category

Fields:

name

slug

description

image

status

Order

Fields:

customer

items

subtotal

shipping

total

customerInformation

orderStatus

createdAt

updatedAt

Order statuses:

pending

confirmed

processing

shipped

delivered

cancelled

17. REST API

Create clean RESTful APIs.

Products

GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id


Categories

GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id


Authentication

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me


Orders

POST /api/orders
GET  /api/orders/:id
GET  /api/orders


AI

POST /api/products/:id/generate-tags


Implement:

Request validation

Authentication

Authorization

Proper HTTP status codes

Error handling

Consistent API responses

18. Reusable Frontend Components

Create reusable components instead of duplicating UI.

Components should include:

Header

Footer

ProductCard

ProductGrid

ProductGallery

SearchBar

FilterSidebar

SortDropdown

CategoryCard

CartItem

CartSummary

CheckoutForm

ProductForm

LoadingSpinner

EmptyState

ErrorState

Modal

Button

Input

Select

Badge

Toast/notification

19. Responsive Design

The website must work properly on:

Desktop

Laptop

Tablet

Mobile

Use mobile-first responsive design.

Important areas:

Navigation

Product grid

Product details

Filters

Cart

Checkout

Admin product table

Avoid horizontal scrolling and broken layouts.

20. Validation & Error Handling

Implement proper validation on both frontend and backend.

Handle:

Invalid product data

Invalid prices

Negative inventory

Missing checkout fields

Invalid email

Authentication errors

API failures

Database errors

AI API failures

Product not found

Out-of-stock products

Display user-friendly messages.

Never expose sensitive backend errors or API keys to the frontend.

21. Security

Implement basic production security:

Password hashing

JWT authentication

Protected admin routes

Role-based authorization

Environment variables

Input validation

API error handling

CORS configuration

Rate limiting for sensitive APIs

Never expose AI API keys

Never expose database credentials

22. UI/UX Requirements

Design should be:

Modern

Minimal

Premium

Clean

Product-focused

Fast

Mobile-friendly

Use:

Large product imagery

Clean typography

Generous whitespace

Simple navigation

Clear CTAs

Consistent spacing

Subtle hover effects

Good loading states

Do NOT copy Allbirds directly.

Use it only as visual inspiration.

23. Project Structure

Use a clean structure such as:

ecommerce/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── config/
│   └── server.ts
│
├── README.md
└── .gitignore


24. Environment Variables

Use environment variables for:

DATABASE_URL
JWT_SECRET
AI_API_KEY
NEXT_PUBLIC_API_URL


Never hardcode credentials.

Create:

.env.example

with placeholder values.

25. Deployment

Push the complete project to GitHub.

Deploy:

Frontend → Vercel

Backend → suitable Node.js hosting

Database → MongoDB Atlas

Configure:

Production environment variables

CORS

API URLs

Database connection

AI API key

Verify the complete production flow after deployment.

26. Testing Checklist

Before completion, test:

Customer

Home page

Product browsing

Search

Filtering

Product details

Add to cart

Update quantity

Remove item

Checkout

Order creation

Order confirmation

Admin

Login

Product creation

Product editing

Product deletion

Inventory updates

AI tag generation

Technical

API endpoints

Database operations

Authentication

Validation

Error handling

Responsive design

Production deployment

27. Important Scope Rule

Do NOT over-engineer this project.

This is a small e-commerce MVP.

Prioritize:

Clean storefront

Product catalog

Search/filter

Product details

Cart

Checkout/order flow

Basic product management

AI tagging

REST API

Database

Deployment

Avoid unnecessary features such as:

Complex marketplace functionality

Multi-vendor support

Advanced recommendation engines

Complex inventory systems

Microservices

Real-time architecture

Advanced analytics

Complex payment infrastructure unless specifically requested

The goal is to deliver a simple, polished, production-ready e-commerce website efficiently.

28. Final Deliverables

The completed project should include:

Responsive e-commerce frontend

Product catalog

Categories

Search

Filters

Product detail pages

Shopping cart

Checkout

Order creation

Basic authentication

Admin product management

AI product tagging

REST APIs

MongoDB database

Validation

Error handling

GitHub repository

Environment configuration

Production deployment

README documentation

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
