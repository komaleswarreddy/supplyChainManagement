# Procurement Forms - New Implementation

## Overview

This document describes the new procurement forms that have been created to replace the non-functional existing forms. The new forms are built with mocked data and simplified dependencies to ensure they work properly.

## New Forms

### 1. Requisition Form
**File:** `src/pages/procurement/requisitions/new-requisition-form.tsx`

**Features:**
- Create new purchase requisitions
- Add multiple items with quantities and prices
- Select department and cost center
- Provide justification and notes
- Save as draft or submit
- Real-time total calculation
- Form validation with Zod schema

**Mock Data:**
- Departments (Procurement, Operations, Finance, IT, HR, Marketing, Sales, etc.)
- Cost Centers (IT Infrastructure, Office Supplies, Marketing & Advertising, etc.)
- Catalog Items (Laptop Computer, Office Chair, Printer Paper, etc.)
- Unit of Measures (Each, Box, Kilogram, Liter, etc.)

### 2. Purchase Order Form
**File:** `src/pages/procurement/purchase-orders/new-purchase-order-form.tsx`

**Features:**
- Create new purchase orders
- Select supplier and PO type
- Add multiple items with delivery dates
- Configure payment and delivery terms
- Set shipping method and currency
- Complete delivery and billing addresses
- Save as draft or create PO
- Real-time total calculation
- Form validation with Zod schema

**Mock Data:**
- Suppliers (Tech Solutions Inc., Office Supplies Co., Furniture World Ltd., etc.)
- PO Types (Standard, Blanket, Contract, Direct)
- Currencies (USD, EUR, GBP, CAD, AUD)
- Shipping Methods (Ground, Air, Sea, Express, Overnight)
- Payment Terms (Net 30, Net 60, Net 90, Due on Receipt)
- Delivery Terms (FOB Destination, FOB Origin, CIF, EXW, etc.)

## Mock Data Service

**File:** `src/services/mock-data.ts`

Centralized mock data service that provides:
- Departments, Cost Centers, Suppliers
- Catalog Items, Unit of Measures
- PO Types, Currencies, Shipping Methods
- Payment Terms, Delivery Terms
- Countries, States
- Helper functions to get data by ID

## Routes

The forms are accessible via these routes:
- **Requisition Form:** `/procurement/requisitions/create` or `/procurement/requisitions/new`
- **Purchase Order Form:** `/procurement/purchase-orders/create` or `/procurement/purchase-orders/new`

## Key Features

### Form Validation
- Uses Zod schema validation
- Real-time validation feedback
- Required field validation
- Data type validation

### User Experience
- Clean, modern UI with shadcn/ui components
- Responsive design
- Loading states during submission
- Success/error toast notifications
- Navigation back to list pages

### Data Management
- Mock data simulation
- Form state management with React Hook Form
- Real-time calculations
- Draft saving capability

## Usage

1. Navigate to the procurement section
2. Click "Create Requisition" or "Create Purchase Order"
3. Fill out the required information
4. Add items as needed
5. Review the summary
6. Save as draft or submit

## Technical Implementation

### Dependencies
- React Hook Form for form management
- Zod for schema validation
- shadcn/ui for UI components
- Lucide React for icons
- React Router for navigation

### State Management
- Local state for loading indicators
- React Hook Form for form state
- Toast notifications for user feedback

### Data Flow
1. Form initialization with default values
2. User input with real-time validation
3. Data submission with mock API simulation
4. Success/error handling with toast notifications
5. Navigation back to list page

## Future Enhancements

1. **Real API Integration:** Replace mock data with actual API calls
2. **File Upload:** Add attachment upload functionality
3. **Approval Workflow:** Implement approval process
4. **Email Notifications:** Add email notifications for submissions
5. **Advanced Validation:** Add business rule validation
6. **Templates:** Add form templates for common scenarios

## Troubleshooting

If the forms are not rendering:
1. Check that all dependencies are installed
2. Verify the routes are properly configured
3. Check browser console for any errors
4. Ensure the mock data service is accessible

## Notes

- These forms are designed to work independently without complex backend dependencies
- All data is mocked and will not persist between sessions
- The forms provide a complete user experience for testing and demonstration
- The implementation follows React best practices and modern UI patterns
