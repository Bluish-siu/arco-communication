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
   * Queries existing webhook subscriptions registered by this app
   */
  getWebhookSubscriptions: async ({ shopDomain, accessToken }) => {
    const query = `
      query GetWebhookSubscriptions {
        webhookSubscriptions(first: 50) {
          edges {
            node {
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
      }
    `;

    const data = await shopifyGraphService.shopifyGraphRequest({
      shopDomain,
      accessToken,
      query,
    });

    const edges = data?.webhookSubscriptions?.edges || [];
    return edges.map((edge) => ({
      id: edge.node?.id,
      topic: edge.node?.topic,
      callbackUrl: edge.node?.endpoint?.callbackUrl || '',
    }));
  },

  /**
   * Deletes a specific webhook subscription by Shopify GraphQL ID
   */
  deleteWebhookSubscription: async ({ shopDomain, accessToken, id }) => {
    const mutation = `
      mutation WebhookSubscriptionDelete($id: ID!) {
        webhookSubscriptionDelete(id: $id) {
          userErrors {
            field
            message
          }
          deletedWebhookSubscriptionId
        }
      }
    `;

    const data = await shopifyGraphService.shopifyGraphRequest({
      shopDomain,
      accessToken,
      query: mutation,
      variables: { id },
    });

    const userErrors = data?.webhookSubscriptionDelete?.userErrors;
    if (userErrors && userErrors.length > 0) {
      const msg = userErrors.map((e) => `${e.field?.join('.') || 'error'}: ${e.message}`).join(', ');
      console.warn(`[Shopify Webhook Deletion Warning (${id}) for ${shopDomain}]:`, msg);
      return { success: false, errors: msg };
    }

    return {
      success: true,
      deletedId: data?.webhookSubscriptionDelete?.deletedWebhookSubscriptionId,
    };
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
   * Registers and reconciles Phase 1 webhooks for an installed shop.
   * Ensures every Phase 1 topic has exactly one active subscription pointing to webhookUrl.
   * Automatically detects and removes obsolete subscriptions (e.g. old Vercel URL)
   * and prevents duplicate subscriptions for the same topic.
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

    // 1. Query existing webhook subscriptions for this app
    let existingSubscriptions = [];
    try {
      existingSubscriptions = await shopifyGraphService.getWebhookSubscriptions({
        shopDomain,
        accessToken,
      });
    } catch (err) {
      console.warn(`[Shopify Query Existing Webhooks Warning for ${shopDomain}]:`, err.message);
    }

    const results = [];

    for (const topic of topics) {
      try {
        // Find existing subscriptions belonging to this Phase 1 topic
        const topicSubs = existingSubscriptions.filter((sub) => sub.topic === topic);

        let activeValidSub = null;

        for (const sub of topicSubs) {
          // If already pointing to the target webhookUrl and no active one assigned yet, keep it
          if (sub.callbackUrl === webhookUrl && !activeValidSub) {
            activeValidSub = sub;
          } else {
            // Delete obsolete subscription (e.g. old Vercel destination) or redundant duplicate
            console.log(
              `[Shopify Webhook Reconcile] Removing obsolete/duplicate subscription ${sub.id} for topic "${topic}" (old destination: ${sub.callbackUrl})`
            );
            await shopifyGraphService.deleteWebhookSubscription({
              shopDomain,
              accessToken,
              id: sub.id,
            });
          }
        }

        // If a valid subscription already exists pointing to webhookUrl, avoid re-registering
        if (activeValidSub) {
          results.push({
            topic,
            success: true,
            reconciled: true,
            subscription: activeValidSub,
          });
        } else {
          // Create new subscription pointing to target webhookUrl
          const res = await shopifyGraphService.registerWebhookSubscription({
            shopDomain,
            accessToken,
            topic,
            callbackUrl: webhookUrl,
          });
          results.push({ topic, ...res });
        }
      } catch (err) {
        results.push({ topic, success: false, error: err.message });
      }
    }

    return results;
  },
};
