/**
 * Shopify Admin GraphQL API Service (API Version: 2026-07)
 * Executes authenticated Admin GraphQL queries and mutations using native fetch.
 */
export const shopifyGraphService = {
  /**
   * Generic authenticated GraphQL request helper
   * @param {Object} params
   * @param {string} params.shopDomain - myshopify.com domain
   * @param {string} params.accessToken - Admin API access token
   * @param {string} params.query - GraphQL query or mutation string
   * @param {Object} [params.variables] - GraphQL variables object
   * @returns {Promise<Object>} GraphQL response data
   */
  shopifyGraphRequest: async ({ shopDomain, accessToken, query, variables = {} }) => {
    if (!shopDomain) throw new Error('Shop domain is required for GraphQL request');
    if (!accessToken) throw new Error('Access token is required for GraphQL request');

    const endpoint = `https://${shopDomain}/admin/api/2026-07/graphql.json`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      // Handle HTTP rate limit (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '2';
        console.warn(`[Shopify GraphQL Rate Limited (429) for ${shopDomain}]. Retry-After: ${retryAfter}s`);
        throw new Error(`Shopify API rate limit exceeded. Retry after ${retryAfter} seconds.`);
      }

      // Handle Authentication Failure (401)
      if (response.status === 401) {
        console.warn(`[Shopify GraphQL Unauthorized (401) for ${shopDomain}]: Access token invalid or revoked.`);
        throw new Error('Shopify access token is invalid, expired, or revoked.');
      }

      if (!response.ok) {
        throw new Error(`Shopify GraphQL HTTP error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();

      // Check GraphQL-level errors
      if (json.errors && json.errors.length > 0) {
        const errorMessages = json.errors.map((e) => e.message).join('; ');
        console.warn(`[Shopify GraphQL Error for ${shopDomain}]:`, errorMessages);
        throw new Error(`Shopify GraphQL query error: ${errorMessages}`);
      }

      return json.data;
    } catch (err) {
      // Never log the access token
      console.warn(`[Shopify GraphQL Request Error for ${shopDomain}]:`, err.message);
      throw err;
    }
  },

  /**
   * Retrieves shop metadata: id, name, email, myshopifyDomain, currencyCode
   */
  getShop: async ({ shopDomain, accessToken }) => {
    const query = `
      query GetShopMetadata {
        shop {
          id
          name
          email
          myshopifyDomain
          currencyCode
        }
      }
    `;

    const data = await shopifyGraphService.shopifyGraphRequest({
      shopDomain,
      accessToken,
      query,
    });

    return data?.shop || null;
  },

  /**
   * Registers a single webhook subscription via GraphQL
   */
  registerWebhookSubscription: async ({ shopDomain, accessToken, topic, callbackUrl }) => {
    const mutation = `
      mutation RegisterWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          userErrors {
            field
            message
          }
          webhookSubscription {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
          }
        }
      }
    `;

    const variables = {
      topic,
      webhookSubscription: {
        callbackUrl,
        format: 'JSON',
      },
    };

    const data = await shopifyGraphService.shopifyGraphRequest({
      shopDomain,
      accessToken,
      query: mutation,
      variables,
    });

    const userErrors = data?.webhookSubscriptionCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      const msg = userErrors.map((e) => `${e.field?.join('.') || 'error'}: ${e.message}`).join(', ');
      console.warn(`[Shopify Webhook Registration Warning (${topic}) for ${shopDomain}]:`, msg);
      return { success: false, errors: msg };
    }

    return {
      success: true,
      subscription: data?.webhookSubscriptionCreate?.webhookSubscription,
    };
  },

  /**
   * Registers Phase 1 webhooks for an installed shop
   */
  registerPhase1Webhooks: async ({ shopDomain, accessToken, webhookUrl }) => {
    const topics = [
      'APP_UNINSTALLED',
      'CUSTOMERS_CREATE',
      'CUSTOMERS_UPDATE',
      'PRODUCTS_CREATE',
      'PRODUCTS_UPDATE',
      'ORDERS_CREATE',
      'ORDERS_UPDATED',
    ];

    const results = [];
    for (const topic of topics) {
      try {
        const res = await shopifyGraphService.registerWebhookSubscription({
          shopDomain,
          accessToken,
          topic,
          callbackUrl: webhookUrl,
        });
        results.push({ topic, ...res });
      } catch (err) {
        results.push({ topic, success: false, error: err.message });
      }
    }

    return results;
  },
};
