# Marketplace E-commerce Platform - Complete System Documentation

## Project Overview

This is a comprehensive e-commerce marketplace platform designed specifically for the Ugandan market, consisting of two main components:

1. **Frontend**: Angular 19 admin dashboard (`marketplace-dashboard`)
2. **Backend**: Django REST API (`marketplace-backend`)

The system provides a full-featured e-commerce solution with admin management capabilities, customer ordering, product catalog management, promotions, and advanced security features.

## System Architecture

```
┌─────────────────┐    HTTPS/API    ┌──────────────────┐    Database    ┌─────────────────┐
│  Angular Admin  │◄─────────────────│  Django Backend  │◄──────────────│   PostgreSQL    │
│   Dashboard     │                 │    REST API      │               │   (Production)  │
│  (Frontend)     │                 │                  │               │   SQLite (Dev)  │
└─────────────────┘                 └──────────────────┘               └─────────────────┘
        │                                    │
        │                                    │
        ▼                                    ▼
┌─────────────────┐                 ┌──────────────────┐
│   TailwindCSS   │                 │     Redis        │
│     Styling     │                 │     Caching      │
└─────────────────┘                 └──────────────────┘
```

## Frontend - Angular Admin Dashboard

### Technology Stack
- **Framework**: Angular 19.2
- **Styling**: TailwindCSS 3.4.1 with custom forms
- **Charts**: Chart.js 4.4.9
- **HTTP Client**: Angular HttpClient with interceptors
- **Authentication**: JWT-based with refresh tokens
- **Build Tool**: Angular CLI with TypeScript 5.7.2

### Project Structure
```
marketplace-dashboard/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── auth/               # Authentication system
│   │   │   │   ├── guards/         # Route guards
│   │   │   │   ├── interceptors/   # HTTP interceptors
│   │   │   │   ├── models/         # Auth models
│   │   │   │   └── services/       # Auth services
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── header/         # Header component
│   │   │   │   ├── sidebar/        # Navigation sidebar
│   │   │   │   └── main-layout/    # Main layout wrapper
│   │   │   └── services/           # Core services
│   │   ├── features/               # Feature modules
│   │   │   ├── dashboard/          # Analytics dashboard
│   │   │   ├── products/           # Product management
│   │   │   ├── orders/             # Order management
│   │   │   ├── customers/          # Customer management
│   │   │   ├── promotions/         # Promotions & coupons
│   │   │   ├── admin-users/        # Admin user management
│   │   │   ├── settings/           # System settings
│   │   │   └── auth/               # Authentication pages
│   │   └── shared/                 # Shared components
│   ├── assets/                     # Static assets
│   └── environments/               # Environment configs
```

### Key Features

#### Authentication System
- **JWT-based authentication** with access and refresh tokens
- **Route guards** protecting authenticated routes
- **HTTP interceptors** for automatic token attachment
- **Signal-based state management** for reactive user state
- **Auto-token refresh** mechanism

#### Dashboard Analytics
- **Sales trends** with Chart.js visualizations
- **Key metrics** cards (sales, orders, customers, products)
- **Recent orders** overview
- **Top customers** analytics
- **Product performance** charts

#### Product Management
- **Complete CRUD operations** for products
- **Category and brand management** with hierarchical categories
- **Product variations** support (size, color, etc.)
- **Image management** with multiple images per product
- **Inventory tracking** and stock management

#### Order Management
- **Order lifecycle tracking** (pending → delivered/cancelled)
- **Order status updates** with admin notes
- **Customer information** management
- **Payment method** tracking
- **Shipping information** handling

#### Promotions System
- **Campaign management** with scheduling
- **Coupon creation** (single-use, multi-use, user-specific)
- **Promotion rules** (percentage, fixed amount, BXGY)
- **Usage analytics** and reporting

#### Customer Management
- **Customer profiles** with comprehensive information
- **Address management** for customers
- **Order history** per customer
- **Customer analytics** and insights

#### Admin User Management
- **Role-based access control** with staff permissions
- **Admin user creation** and management
- **Password management** with secure policies
- **Permission management** for different access levels

### Configuration

#### Environment Configuration
```typescript
// Development
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiVersion: '/api/v1',
  tokenKey: 'afrisup_admin_token',
};
```

#### Key Services

##### AuthService (src/app/core/auth/services/auth.service.ts)
- **Signal-based reactive state** management
- **JWT token handling** with localStorage
- **Automatic profile loading** on authentication
- **Token refresh** mechanism
- **Logout with server blacklisting**

##### HTTP Interceptors
- **AuthInterceptor**: Automatic JWT token attachment
- **ErrorInterceptor**: Global error handling

### Routing Structure
```typescript
// Main routes with lazy loading
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/dashboard.component'),
  title: 'Dashboard'
},
{
  path: 'products',
  loadChildren: () => import('./features/products/products.routes'),
  title: 'Products Management'
},
{
  path: 'orders',
  loadChildren: () => import('./features/orders/orders.routes'),
  title: 'Orders Management'
}
```

## Backend - Django REST API

### Technology Stack
- **Framework**: Django 5.2.1 with Django REST Framework 3.16.0
- **Authentication**: JWT with Simple JWT 5.5.0
- **Database**: PostgreSQL (production), SQLite (development)
- **Caching**: Redis with django-redis
- **Image Processing**: Pillow 11.2.1
- **API Documentation**: drf-spectacular
- **CORS**: django-cors-headers
- **Production Server**: Gunicorn with Nginx

### Project Structure
```
marketplace-backend/
├── marketplace/                    # Django project settings
│   ├── settings.py                # Main settings with environment variables
│   ├── urls.py                    # Root URL configuration
│   └── wsgi.py                    # WSGI application
├── users/                         # User management app
│   ├── models/                    # User-related models
│   ├── serializers/               # API serializers
│   ├── views/                     # API views and viewsets
│   ├── services/                  # Business logic services
│   └── backends/                  # Custom authentication backends
├── products/                      # Product catalog app
├── orders/                        # Order management app
├── promotions/                    # Promotions and coupons app
├── dashboard/                     # Analytics and dashboard app
├── security/                      # Security and audit app
└── utils/                         # Shared utilities
```

### Database Models

#### User Management System

##### User Model (users/models/user_model.py)
```python
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=15, unique=True)  # Primary auth field
    email = models.EmailField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
```

##### User Profile Model
- **Personal Information**: Profile picture, bio, date of birth, gender
- **Location Data**: City, state, country, postal code
- **Preferences**: Timezone, language settings
- **Privacy Settings**: Public profile, email/phone visibility

##### Address Model
- **Multiple addresses per user** with default address logic
- **Ugandan context**: Predefined district choices (Kampala, Wakiso, etc.)
- **Validation**: Ugandan phone number format validation

#### Product Catalog System

##### Product Model (products/models/product_model.py)
```python
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    stock_quantity = models.IntegerField(default=0)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    brand = models.ForeignKey('Brand', on_delete=models.SET_NULL, null=True)
    has_variations = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
```

##### Category Model
- **Hierarchical structure** with self-referencing parent field
- **Image uploads** with custom path handling
- **Display ordering** and active status management

##### Product Variations
- **Flexible JSON-based attributes** (color, size, etc.)
- **Individual pricing** and stock tracking
- **Automatic SKU generation**

##### Product Reviews System
- **1-5 star ratings** with validation
- **Rich content**: Title, comment, optional images
- **Verification**: Purchase verification flags
- **Moderation**: Approval system with flagging
- **Helpfulness tracking**: Separate helpful/not helpful votes

#### Order Management System

##### Order Model (orders/models/order_model.py)
```python
class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True)  # AF[YY][MM][6-digit-hex]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Customer Information
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=15)
    customer_email = models.EmailField(null=True, blank=True)
    delivery_address = models.TextField()
    
    # Order Status and Timing
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Financial Information
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment and Delivery
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
```

##### Order Status Tracking
- **7-stage status system**: pending, confirmed, processing, shipped, delivered, cancelled, refunded
- **Complete audit trail** with status history
- **Admin notes** for status changes

##### Cart System
- **Persistent cart** with OneToOne user relationship
- **Variation support** for cart items
- **Automatic price calculation**

##### Wishlist System
- **Simple product tracking** with timestamps
- **User-specific wishlists**

#### Promotions and Coupon System

##### Campaign Model (promotions/models/campaign_model.py)
```python
class Campaign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    banner_image = models.ImageField(upload_to='campaigns/')
    
    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Campaign Types
    campaign_type = models.CharField(max_length=50, choices=CAMPAIGN_TYPE_CHOICES)
    
    # Usage Limits
    max_total_usage = models.IntegerField(null=True, blank=True)
    max_usage_per_user = models.IntegerField(default=1)
    
    # Targeting
    new_customers_only = models.BooleanField(default=False)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
```

##### Promotion Model
- **Flexible discount types**: Percentage, fixed amount, BXGY, free shipping
- **Targeting options**: Entire order, specific products, categories, brands
- **Complex logic**: Stackable promotions, priority ordering
- **Conditions**: Minimum quantity/amount requirements

##### Coupon System
- **Automatic code generation** with uniqueness
- **Multiple coupon types**: Single-use, multi-use, user-specific
- **Usage tracking** and limits
- **User targeting** capabilities

##### Promotion Usage Tracking
- **Complete audit trail** for every usage
- **Financial impact tracking**: Original amount, discount, final amount
- **User and order linking**

#### Security and Audit System

##### Security Settings (security/models/security_settings_model.py)
- **Two-factor authentication** with backup codes
- **Notification preferences** for security events
- **Biometric support** settings
- **Session management** with configurable timeouts

##### Session Management
- **Multi-device support**: Web, mobile, tablet, desktop
- **Device information** tracking
- **Location tracking** with GeoIP2
- **Session control** with expiration

##### Security Audit Log
- **Comprehensive logging**: 11 different action types
- **Context information**: IP, user agent, device info, location
- **Risk assessment**: Low/Medium/High/Critical levels
- **Metadata support** with JSON fields

##### Privacy and GDPR Compliance
- **Data privacy settings** with granular controls
- **Account deletion requests** with grace periods
- **Data export requests** for user data portability

### API Structure

#### Authentication Endpoints (users/urls.py)
```python
# Authentication
POST /api/v1/users/login/              # User login
POST /api/v1/users/logout/             # User logout
POST /api/v1/users/register/           # User registration
POST /api/v1/users/token/refresh/      # Token refresh

# Password Management
POST /api/v1/users/password/reset/     # Password reset request
POST /api/v1/users/password/confirm/   # Password reset confirmation
POST /api/v1/users/password/change/    # Password change

# Profile Management
GET  /api/v1/users/profile/            # Get user profile
PUT  /api/v1/users/profile/            # Update user profile
POST /api/v1/users/profile/avatar/     # Upload profile picture
```

#### Product Endpoints (products/urls.py)
```python
# Products
GET    /api/v1/products/               # List products
POST   /api/v1/products/               # Create product
GET    /api/v1/products/{id}/          # Get product detail
PUT    /api/v1/products/{id}/          # Update product
DELETE /api/v1/products/{id}/          # Delete product

# Categories
GET    /api/v1/categories/             # List categories
POST   /api/v1/categories/             # Create category

# Brands
GET    /api/v1/brands/                 # List brands
POST   /api/v1/brands/                 # Create brand
```

#### Order Endpoints (orders/urls.py)
```python
# Orders
GET    /api/v1/orders/                 # List orders
POST   /api/v1/orders/                 # Create order
GET    /api/v1/orders/{id}/            # Get order detail
PUT    /api/v1/orders/{id}/            # Update order status

# Cart
GET    /api/v1/orders/cart/            # Get user cart
POST   /api/v1/orders/cart/items/      # Add to cart
PUT    /api/v1/orders/cart/items/{id}/ # Update cart item
DELETE /api/v1/orders/cart/items/{id}/ # Remove from cart
```

#### Dashboard Endpoints (dashboard/urls.py)
```python
GET /api/v1/dashboard/summary/         # Dashboard summary data
GET /api/v1/dashboard/sales-trends/    # Sales trend analytics
GET /api/v1/dashboard/top-products/    # Top performing products
GET /api/v1/dashboard/recent-orders/   # Recent orders overview
```

### Key Features

#### Advanced Caching Strategy
```python
# Redis configuration with multiple databases
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/0',
        'TIMEOUT': 86400,  # 24 hours
    },
    'products': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/1',
        'TIMEOUT': 86400,  # 24 hours for product data
    }
}
```

#### Security Features
- **JWT authentication** with blacklisting
- **Rate limiting** for API endpoints
- **CORS configuration** for production domains
- **Security headers** (XSS protection, content type sniffing)
- **HTTPS enforcement** in production
- **Comprehensive audit logging**

#### Ugandan Market Localization
- **Phone number validation** for Ugandan format
- **District choices** for address system
- **Local payment methods**: MTN Money, Airtel Money
- **Currency formatting** for UGX

### Production Deployment

#### Server Configuration
- **Nginx** as reverse proxy with SSL
- **Gunicorn** as WSGI server
- **PostgreSQL** as production database
- **Redis** for caching and sessions
- **Let's Encrypt** for SSL certificates

#### Backup and Monitoring
- **Automated daily backups** of database and media
- **Log rotation** for application and server logs
- **Health check endpoints** for monitoring
- **Error tracking** with comprehensive logging

#### Performance Optimization
- **Database connection pooling**
- **Static file compression** with Nginx
- **Image optimization** for product photos
- **Query optimization** with select_related and prefetch_related

## Integration Points

### Frontend ↔ Backend Communication
- **REST API** communication with JSON
- **JWT token-based** authentication
- **Error handling** with standardized error responses
- **File uploads** for images with multipart/form-data

### Data Flow Example: Order Creation
1. **Frontend**: User submits order form
2. **Backend**: Validates order data and inventory
3. **Backend**: Creates order with auto-generated order number
4. **Backend**: Updates product stock quantities
5. **Backend**: Sends order confirmation email
6. **Frontend**: Displays order confirmation with tracking info

### Authentication Flow
1. **Login**: Frontend sends credentials to `/api/v1/users/login/`
2. **Backend**: Validates and returns JWT tokens
3. **Frontend**: Stores tokens and sets authentication state
4. **API Calls**: Frontend automatically attaches Bearer token
5. **Token Refresh**: Automatic refresh when access token expires

## Business Logic Highlights

### Order Processing Pipeline
1. **Cart Management**: Add/remove items with real-time pricing
2. **Inventory Validation**: Check stock availability
3. **Order Creation**: Generate order number and lock inventory
4. **Payment Processing**: Handle multiple payment methods
5. **Fulfillment**: Track order status through delivery
6. **Post-Delivery**: Enable reviews and feedback

### Promotion Engine
1. **Campaign Scheduling**: Time-based activation/deactivation
2. **Rule Evaluation**: Apply complex discount logic
3. **Stacking Logic**: Handle multiple promotions
4. **Usage Tracking**: Monitor promotion performance
5. **Analytics**: Generate promotion effectiveness reports

### User Experience Features
- **Real-time inventory** updates
- **Personalized recommendations** based on browsing history
- **Multi-address management** for delivery flexibility
- **Order tracking** with status updates
- **Review and rating system** for products
- **Wishlist functionality** for future purchases

## Security and Compliance

### Data Protection
- **GDPR compliance** with data export/deletion
- **Personal data encryption** for sensitive information
- **Secure file uploads** with type validation
- **SQL injection protection** with ORM
- **XSS prevention** with proper escaping

### Access Control
- **Role-based permissions** for admin users
- **API rate limiting** to prevent abuse
- **Session management** with secure cookies
- **Two-factor authentication** support
- **Device tracking** for security monitoring

### Audit and Monitoring
- **Complete audit trails** for all critical actions
- **Security event logging** with risk assessment
- **Performance monitoring** with detailed logging
- **Error tracking** and alerting
- **Backup verification** and recovery testing

## Development Workflow

### Frontend Development
```bash
# Start development server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Deploy to server
scp -r dist/marketplace-dashboard/browser/* root@server:/var/www/marketplace-dashboard/
```

### Backend Development
```bash
# Run development server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py create_admin_user

# Collect static files
python manage.py collectstatic

# Seed test data
python manage.py seed_users
python manage.py seed_products
```

This comprehensive marketplace platform provides a robust foundation for e-commerce operations with modern architecture, security best practices, and scalable design patterns specifically tailored for the Ugandan market.