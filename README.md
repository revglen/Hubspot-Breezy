# Breezy HubSpot Integration POC - README

## A. Setup Instructions

### How to run your application locally

The below setup will show how the breezy-hubspot-poc can be executed from the locally while connecting to HubSpot and Google AI.

1. **Dependencies or Prerequisites**

**Backend:**
- Node.js 16+
- Express.js
- HubSpot API access
- Google Gemini API key (for AI features)

**Frontend:**
- Angular 25.2.1
- Angular CLI
- Modern web browser

### Expected Environment Variables

Create `.env` file in backend directory:
```
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
GOOGLE_AI_API_KEY=your_google_gemini_api_key
PORT=3001
```


1. **Clone the repository**

Navigate to the GitHub repo listed below and then open the folder - breezy-hubspot-poc
```
git clone https://github.com/revglen/Hubspot-Breezy.git
cd breezy-hubspot-poc
```

2. **Backend Setup**

The server.js has been modified to support Google AI API.
The Google AI API will be wrapped by local APIs within the server.js which will be called from the front end.
In order to run the application, an .env file will have to created with the HubSpot and Google AI API Keys. 
Please have a look at the section below - Expected Environment Variables - for the setup
```
cd server
npm install
npm start
```
Server runs on http://localhost:3001

3. **Frontend Setup**
```
cd frontend
npm install
ng serve
```
Application runs on http://localhost:4200




### How to test the integration flow

1. **Contact Sync Test:**
   - Navigate to "Contacts → Add Contact"
   - Fill out customer purchase form
   - Submit to create contact in HubSpot
   - Verify in "Show Contacts"

2. **Deal Creation Test:**
   - Navigate to "Deals → Create Deal"
   - Select a customer and subscription type
   - Create deal to track subscription conversion

3. **AI Insights Test:**
   - Navigate to "AI Insights"
   - Select customer and generate insights
   - Review AI-powered recommendations

## B. Project Overview

This proof-of-concept demonstrates how Breezy can integrate their e-commerce platform with HubSpot to track customer data and subscription conversions. The POC simulates Breezy's admin panel where their team can:

- Sync customer data from thermostat purchases to HubSpot contacts
- Track subscription conversions from free trials to paid plans as deals
- View customer subscription status and revenue per customer
- Generate AI-powered insights for customer retention and upsell opportunities

The application represents a simplified version of what Breezy's engineering team would build into their actual platform, demonstrating integration patterns and data architecture.

## C. AI Usage Documentation

### Which AI tools did you use?
- Google Gemini API (free tier) for AI-powered insights
- AI assistance for code generation and problem-solving

### What tasks did you use AI for?
- Generating customer insights based on subscription patterns
- Providing business intelligence recommendations
- Code implementation for Angular components
- Database schema design and ERD creation
- Documentation writing and technical explanations

### What did you learn? What was challenging?
**Learned:**
- Effective prompt engineering for technical requirements
- How to structure AI responses for consistent JSON parsing
- Integration patterns for AI services in Angular applications
- Error handling for AI API failures

**Challenging:**
- Ensuring consistent JSON output from AI responses
- Handling API rate limits and errors gracefully
- Balancing AI-generated code with Angular best practices
- Protecting API keys through server-side implementation

### How did AI help (or not help)?
**Helpful for:**
- Rapid prototyping and code generation
- Exploring different architectural approaches
- Generating comprehensive documentation
- Creating realistic sample data and business logic

**Limitations:**
- Required significant validation and error handling
- Needed manual refinement of generated code
- Sometimes over-engineered simple solutions
- Required careful review for Angular-specific patterns

## D. HubSpot Data Architecture

### Entity Relationship Diagram (ERD)

```
CONTACTS (1) ←→ (M) DEALS
CONTACTS (M) ←→ (1) COMPANIES
DEALS (M) ←→ (M) PRODUCTS (via DEAL_PRODUCTS junction)
CONTACTS (1) ←→ (M) ACTIVITIES
CONTACTS (1) ←→ (M) TICKETS
```

**Key Objects:**
- **Contacts**: Individual customers with thermostat ownership tracking
- **Deals**: Subscription conversions with revenue tracking
- **Companies**: B2B customers and distributors
- **Products**: Hardware and subscription catalog
- **Activities**: Customer interactions and touchpoints
- **Tickets**: Support cases linked to subscriptions

### Deal Pipeline Architecture

**Default Pipeline Stages:**
1. Appointment Scheduled (Initial contact)
2. Qualified to Buy (Trial started)
3. Presentation Scheduled (Product demo)
4. Decision Maker Bought-In (Trial engagement)
5. Contract Sent (Subscription offer)
6. Closed Won (Active subscription)
7. Closed Lost (Trial expired/cancelled)

**Subscription-specific Properties:**
- `subscription_type`: monthly|annual|lifetime
- `trial_end_date`: Track trial expiration
- `renewal_date`: Auto-renewal tracking
- `thermostat_serial`: Hardware association

## E. AI Feature Explanation

### Describe your AI-powered feature
The AI-powered customer intelligence feature analyzes customer data and subscription patterns to generate actionable business insights. It examines contact information, deal history, and subscription behavior to identify upsell opportunities, retention risks, and expansion potential.

### Why did you choose this feature?
This feature directly addresses Breezy's need to "be smarter about customer data" by transforming raw HubSpot data into strategic insights. It demonstrates how AI can add value to existing CRM data without requiring additional data entry or complex setup.

### How does it make the integration smarter?
- **Predictive Analysis**: Identifies customers likely to churn or upgrade
- **Personalized Recommendations**: Suggests specific actions for each customer
- **Revenue Optimization**: Highlights high-value opportunities
- **Proactive Engagement**: Flags at-risk subscriptions before cancellation

### When would you use AI vs traditional rules/logic?
**Use AI for:**
- Pattern recognition across large datasets
- Predicting customer behavior trends
- Generating nuanced recommendations
- Analyzing unstructured data patterns

**Use traditional logic for:**
- Simple if-then business rules
- Fixed pricing calculations
- Basic segmentation rules
- Straightforward workflow automation

## F. Design Decisions

### Technical choices you made and why
- **Angular 25.2.1**: Modern framework with strong typing and component architecture
- **Standalone Components**: Latest Angular pattern for better performance and simplicity
- **Signals-based State**: Reactive state management replacing traditional RxJS complexity
- **Server-side AI**: Protects API keys and enables request optimization
- **Modular Architecture**: Separated concerns for contacts, deals, and AI features

### Assumptions you made about Breezy's platform
- Existing e-commerce system can trigger webhooks to sync data
- Customer accounts are created during thermostat purchase process
- Subscription management system can track trial-to-paid conversions
- Basic customer data (name, email, address) is available post-purchase
- Team has technical resources to implement production integration

### What you'd improve with more time
- Add real-time webhook support for automatic data sync
- Implement comprehensive error handling and retry logic
- Add user authentication and role-based access
- Create comprehensive unit and integration tests
- Build advanced analytics dashboards with charts
- Add bulk operations for contact and deal management

### What you'd ask the client before building production version
1. **Technical Integration**
   - What e-commerce platform are you using?
   - Do you have webhook capabilities for real-time sync?
   - What's your current subscription management system?

2. **Business Requirements**
   - What specific metrics does your team need to track?
   - How do you currently handle customer segmentation?
   - What reporting requirements do stakeholders have?

3. **Scale Considerations**
   - Expected volume of monthly customer acquisitions?
   - Number of team members who will use the admin panel?
   - Integration with other existing systems (email, support, accounting)?

4. **Security & Compliance**
   - Data retention and privacy requirements?
   - Authentication and access control needs?
   - Compliance with industry regulations (GDPR, CCPA)?