require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory (for easy frontend development)
app.use(express.static(path.join(__dirname, 'public')));

// HubSpot API configuration
const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Fetch Google Key from the configuration
GOOGLE_AI_API_KEY=process.env.GOOGLE_AI_API_KEY

// Validate token on startup
if (!HUBSPOT_TOKEN) {
  console.error('❌ ERROR: HUBSPOT_ACCESS_TOKEN not found in .env file');
  console.error('Please create a .env file and add your HubSpot Private App token');
  process.exit(1);
}

//validate the Google API Key on Startup
if (!GOOGLE_AI_API_KEY) {
  console.error('❌ ERROR: GOOGLE_AI_API_KEY not found in .env file');
  console.error('Please create a .env file and add your Google API Key');
  process.exit(1);
}

//Create the universal Google Gen AI instance
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// GET endpoint - Fetch contacts from HubSpot
app.get('/api/contacts', async (req, res) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 50,
          properties: 'firstname,lastname,email,phone,address'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching contacts:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch contacts',
      details: error.response?.data || error.message
    });
  }
});

// POST endpoint - Create new contact in HubSpot
app.post('/api/contacts', async (req, res) => {
  try {
    const response = await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
      {
        properties: req.body.properties
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error creating contact:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create contact',
      details: error.response?.data || error.message
    });
  }
});

// GET endpoint - Fetch all deals from HubSpot
app.get('/api/deals', async (req, res) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/deals`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 50,
          properties: 'dealname,amount,dealstage,closedate,pipeline'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching deals:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch deals',
      details: error.response?.data || error.message
    });
  }
});

// POST endpoint - Create new deal and associate to contact
app.post('/api/deals', async (req, res) => {
  try {
    const { dealProperties, contactId } = req.body;
    
    // Create the deal with association to contact
    const dealResponse = await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/deals`,
      {
        properties: dealProperties,
        associations: contactId ? [{
          to: { id: contactId },
          types: [{
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3 // Deal to Contact association
          }]
        }] : []
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(dealResponse.data);
  } catch (error) {
    console.error('Error creating deal:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create deal',
      details: error.response?.data || error.message
    });
  }
});

// GET endpoint - Fetch deals associated with a specific contact
app.get('/api/contacts/:contactId/deals', async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // First, get the deal associations for this contact
    const associationsResponse = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/associations/deals`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // If there are associated deals, fetch their full details
    if (associationsResponse.data.results && associationsResponse.data.results.length > 0) {
      const dealIds = associationsResponse.data.results.map(r => r.id);
      
      const dealsResponse = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/objects/deals/batch/read`,
        {
          inputs: dealIds.map(id => ({ id })),
          properties: ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline']
        },
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(dealsResponse.data);
    } else {
      res.json({ results: [] });
    }
  } catch (error) {
    console.error('Error fetching deals for contact:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch deals for contact',
      details: error.response?.data || error.message
    });
  }
});

// --------------------------Google AI Services - Start ------------------------------

async function getAvailableModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:', models);
    return models;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

// AI Analysis endpoint for customer insights
app.post('/api/ai/analyse-customer', async (req, res) => {
  try {
    const { contact, deals } = req.body;

    if (!contact || !deals) {
      return res.status(400).json({ error: 'Contact and deals data are required' });
    }

    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch (modelError) {
      console.log('gemini-pro not available, trying gemini-1.0-pro...');
      model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    }

    const prompt = `
      Analyse this customer data and their subscription deals to provide business insights for a smart home thermostat company:

      CUSTOMER:
      - Name: ${contact.properties?.firstname || 'Unknown'} ${contact.properties?.lastname || 'Unknown'}
      - Email: ${contact.properties?.email || 'Not provided'}
      - Company: ${contact.properties?.company || 'Not provided'}
      - Job Title: ${contact.properties?.jobtitle || 'Not provided'}

      SUBSCRIPTION DEALS (${deals.length} deals):
      ${deals.map(deal => `
        - ${deal.properties?.dealname || 'Unknown Deal'}: $${deal.properties?.amount || '0'} (Stage: ${deal.properties?.dealstage || 'unknown'})
      `).join('')}

      Please analyse this customer's behaviour and provide:
      1. 2-3 key insights about their subscription patterns
      2. Specific suggestions for upselling, retention, or expansion
      3. Identify any risks or opportunities

      Format the response as JSON with this structure:
      {
        "insights": [
          {
            "type": "upsell_opportunity|retention_risk|expansion_opportunity|loyalty_identified",
            "message": "Clear insight description",
            "confidence": 0.85,
            "suggestion": "Actionable suggestion",
            "priority": "high|medium|low"
          }
        ],
        "summary": "Brief overall summary of this customer's value and potential"
      }

      Be concise and business-focused. If you cannot analyse the data, provide reasonable fallback insights.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsedResponse = parseAIResponse(text);
    
    res.json({
      contact,
      deals,
      insights: parsedResponse.insights || getFallbackInsights().insights,
      summary: parsedResponse.summary || getFallbackInsights().summary
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Return fallback insights if AI fails
    res.json({
      contact: req.body.contact,
      deals: req.body.deals,
      insights: getFallbackInsights().insights,
      summary: getFallbackInsights().summary
    });
  }
});

// AI Analysis endpoint for business intelligence
app.post('/api/ai/analyse-business', async (req, res) => {
  try {
    const { contacts, deals } = req.body;

    if (!contacts || !deals) {
      return res.status(400).json({ error: 'Contacts and deals data are required' });
    }

    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch (modelError) {
      console.log('gemini-pro not available, trying gemini-1.0-pro...');
      model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    }

    const prompt = `
      Analyse this business data for Breezy smart home company:

      TOTAL CUSTOMERS: ${contacts.length}
      TOTAL DEALS: ${deals.length}

      DEAL BREAKDOWN:
      - Active Subscriptions: ${deals.filter(d => d.properties?.dealstage === 'closedwon').length}
      - Total Monthly Revenue: $${calculateMonthlyRevenue(deals)}
      - Conversion Rate: ${calculateConversionRate(contacts, deals)}%

      Provide 3-5 strategic business insights and recommendations for a smart home thermostat company.

      Format as JSON:
      {
        "overview": "Brief business overview",
        "key_metrics": {
          "total_customers": ${contacts.length},
          "active_subscriptions": ${deals.filter(d => d.properties?.dealstage === 'closedwon').length},
          "monthly_recurring_revenue": ${calculateMonthlyRevenue(deals)},
          "conversion_rate": ${calculateConversionRate(contacts, deals)}
        },
        "insights": [
          {
            "title": "Insight title",
            "description": "Detailed insight",
            "recommendation": "Actionable recommendation",
            "impact": "high|medium|low"
          }
        ],
        "top_opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
      }

      If you cannot analyse the data, provide reasonable fallback business insights.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const parsedResponse = parseAIResponse(text);
    res.json({
      ...parsedResponse,
      key_metrics: parsedResponse.key_metrics || {
        total_customers: contacts.length,
        active_subscriptions: deals.filter(d => d.properties?.dealstage === 'closedwon').length,
        monthly_recurring_revenue: calculateMonthlyRevenue(deals),
        conversion_rate: calculateConversionRate(contacts, deals)
      },
      insights: parsedResponse.insights || getFallbackBusinessInsights().insights,
      top_opportunities: parsedResponse.top_opportunities || getFallbackBusinessInsights().top_opportunities
    });

  } catch (error) {
    console.error('Business AI Analysis Error:', error);
    res.json(getFallbackBusinessInsights());
  }
});

// Health check endpoint for AI service
app.get('/api/ai/status', async (req, res) => {
  try {
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch (modelError) {
      model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    }
    
    const result = await model.generateContent('Say "OK" if you are working.');
    const response = await result.response;
    
    res.json({ 
      status: 'connected',
      message: 'AI service is properly configured and responding',
      model: model.model
    });
  } catch (error) {
    console.error('AI Status Check Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'AI service is not properly configured',
      error: error.message,
      suggestion: 'Check your API key and available models'
    });
  }
});

// Debug endpoint to list available models
app.get('/api/ai/models', async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch models',
      details: error.message 
    });
  }
});

// Helper functions
function parseAIResponse(text) {
  try {
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('AI Response Parsing Error:', error);
    console.log('Raw AI response:', text);
    return getFallbackInsights();
  }
}

function getFallbackInsights() {
  return {
    insights: [
      {
        type: 'upsell_opportunity',
        message: 'Customer has shown interest in smart home technology and could benefit from premium features',
        confidence: 0.7,
        suggestion: 'Offer annual subscription with additional smart home integration features',
        priority: 'medium'
      },
      {
        type: 'retention_risk',
        message: 'Customer is on monthly plan which has higher churn risk',
        confidence: 0.6,
        suggestion: 'Proactively offer loyalty discount for annual commitment',
        priority: 'medium'
      }
    ],
    summary: 'Customer has potential for growth with the right engagement strategy.'
  };
}

function getFallbackBusinessInsights() {
  return {
    overview: "Your smart home thermostat business is growing with opportunities for expansion.",
    key_metrics: {
      total_customers: 0,
      active_subscriptions: 0,
      monthly_recurring_revenue: 0,
      conversion_rate: 0
    },
    insights: [
      {
        title: "Focus on Customer Retention",
        description: "Improving customer retention can significantly increase lifetime value",
        recommendation: "Implement a customer success program and proactive support",
        impact: "high"
      },
      {
        title: "Expand Product Offerings",
        description: "Customers may be interested in additional smart home products",
        recommendation: "Consider bundling thermostats with other smart home devices",
        impact: "medium"
      }
    ],
    top_opportunities: [
      "Upsell existing customers to annual plans",
      "Expand into commercial building automation",
      "Develop partnerships with HVAC companies"
    ]
  };
}

function calculateMonthlyRevenue(deals) {
  const monthlyDeals = deals.filter(deal => 
    deal.properties?.dealstage === 'closedwon' && 
    deal.properties?.dealname?.toLowerCase().includes('monthly')
  );
  return monthlyDeals.reduce((total, deal) => total + Number(deal.properties?.amount || 0), 0);
}

function calculateConversionRate(contacts, deals) {
  const customersWithDeals = new Set(
    deals.flatMap(deal => 
      deal.associations?.contacts?.results?.map(contact => contact.id) || []
    )
  );
  return contacts.length > 0 ? Math.round((customersWithDeals.size / contacts.length) * 100) : 0;
}

// --------------------------Google AI Services - End ------------------------------

// Start server
const server = app.listen(PORT, () => {
  console.log('\n✅ Server running successfully!');
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Static files served from: /public`);
  console.log('\n💡 Using hot-reload? Run: npm run dev');
  console.log('🛑 To stop server: Press Ctrl+C\n');
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}, closing server gracefully...`);
  
  server.close(() => {
    console.log('✅ Server closed successfully');
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});