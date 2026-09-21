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
  shopifyGraphRequest: async ({ shopDomain, accessToken, query, variables = {}, maxRetries = 3 }) => {
    if (!shopDomain) throw new Error('Shop domain is required for GraphQL request');
    if (!accessToken) throw new Error('Access token is required for GraphQL request');

    const endpoint = `https://${shopDomain}/admin/api/2026-07/graphql.json`;

    let attempt = 0;
    while (attempt <= maxRetries) {
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
          const retryAfterSec = parseInt(response.headers.get('Retry-After') || '2', 10);
          console.warn(`[Shopify GraphQL Rate Limited (429) for ${shopDomain}]. Waiting ${retryAfterSec}s (attempt ${attempt + 1}/${maxRetries + 1})...`);
          if (attempt < maxRetries) {
            attempt++;
            await new Promise((resolve) => setTimeout(resolve, retryAfterSec * 1000 + 200));
            continue;
          }
          throw new Error(`Shopify API rate limit exceeded. Retry after ${retryAfterSec} seconds.`);
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
          const isThrottled = json.errors.some((e) => (e.message || '').toLowerCase().includes('throttled'));
          if (isThrottled && attempt < maxRetries) {
            attempt++;
            console.warn(`[Shopify GraphQL Throttled for ${shopDomain}]. Backing off (attempt ${attempt}/${maxRetries})...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          const errorMessages = json.errors.map((e) => e.message).join('; ');
          console.warn(`[Shopify GraphQL Error for ${shopDomain}]:`, errorMessages);
          throw new Error(`Shopify GraphQL query error: ${errorMessages}`);
        }

        return json.data;
      } catch (err) {
        if (attempt >= maxRetries || err.message.includes('invalid, expired, or revoked')) {
          console.warn(`[Shopify GraphQL Request Error for ${shopDomain}]:`, err.message);
          throw err;
        }
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
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

  /**
   * Fetches a paginated batch of customers via GraphQL with cursor pagination.
   */
  getCustomersPage: async ({ shopDomain, accessToken, first = 50, after = null }) => {
    const query = `
      query GetCustomersPage($first: Int!, $after: String) {
        customers(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              legacyResourceId
              firstName
              lastName
              email
              phone
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              tags
              defaultAddress {
                phone
              }
              smsMarketingConsent {
                marketingState
                consentUpdatedAt
              }
              emailMarketingConsent {
                marketingState
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
      variables: { first, after },
    });

    const pageInfo = data?.customers?.pageInfo || { hasNextPage: false, endCursor: null };
    const edges = data?.customers?.edges || [];
    const nodes = edges.map((e) => {
      const node = e.node || {};
      const rawId = node.legacyResourceId || (node.id ? String(node.id).split('/').pop() : '');
      const firstName = node.firstName || '';
      const lastName = node.lastName || '';
      const email = node.email || null;
      const phone = node.phone || node.defaultAddress?.phone || null;
      const tags = Array.isArray(node.tags) ? node.tags.join(', ') : (node.tags || '');

      return {
        cursor: e.cursor,
        id: rawId,
        graphql_id: node.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        tags,
        orders_count: parseInt(node.numberOfOrders || 0, 10),
        total_spent: node.amountSpent?.amount || '0.00',
        currency: node.amountSpent?.currencyCode || 'INR',
        sms_marketing_consent: {
          state: node.smsMarketingConsent?.marketingState ? String(node.smsMarketingConsent.marketingState).toLowerCase() : null,
        },
        accepts_marketing: (node.emailMarketingConsent?.marketingState || '').toLowerCase() === 'subscribed',
      };
    });

    return {
      nodes,
      pageInfo: {
        hasNextPage: !!pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor || null,
      },
    };
  },

  /**
   * Fetches a paginated batch of products via GraphQL with cursor pagination.
   */
  getProductsPage: async ({ shopDomain, accessToken, first = 50, after = null }) => {
    const query = `
      query GetProductsPage($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              legacyResourceId
              title
              description
              descriptionHtml
              vendor
              productType
              status
              handle
              featuredImage {
                url
              }
              variants(first: 25) {
                edges {
                  node {
                    id
                    legacyResourceId
                    title
                    price
                    sku
                    availableForSale
                    inventoryQuantity
                  }
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
      variables: { first, after },
    });

    const pageInfo = data?.products?.pageInfo || { hasNextPage: false, endCursor: null };
    const edges = data?.products?.edges || [];
    const nodes = edges.map((e) => {
      const node = e.node || {};
      const variantEdges = node.variants?.edges || [];
      const variants = variantEdges.map((ve) => ({
        id: ve.node?.legacyResourceId || (ve.node?.id ? String(ve.node.id).split('/').pop() : ''),
        graphql_id: ve.node?.id,
        title: ve.node?.title,
        price: ve.node?.price || '0.00',
        sku: ve.node?.sku || '',
        available: ve.node?.availableForSale,
        inventory_quantity: ve.node?.inventoryQuantity,
      }));

      const rawId = node.legacyResourceId || (node.id ? String(node.id).split('/').pop() : '');

      return {
        cursor: e.cursor,
        id: rawId,
        graphql_id: node.id,
        title: node.title || 'Untitled Product',
        description: node.description,
        body_html: node.descriptionHtml,
        vendor: node.vendor || 'Shopify',
        product_type: node.productType || '',
        status: (node.status || '').toLowerCase(),
        handle: node.handle,
        image: node.featuredImage?.url ? { src: node.featuredImage.url } : null,
        variants,
        price: variants[0]?.price || '0.00',
        sku: variants[0]?.sku || null,
      };
    });

    return {
      nodes,
      pageInfo: {
        hasNextPage: !!pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor || null,
      },
    };
  },

  /**
   * Fetches a paginated batch of orders via GraphQL with cursor pagination.
   */
  getOrdersPage: async ({ shopDomain, accessToken, first = 50, after = null }) => {
    const query = `
      query GetOrdersPage($first: Int!, $after: String) {
        orders(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              legacyResourceId
              name
              email
              phone
              createdAt
              cancelledAt
              currencyCode
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalDiscountsSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                legacyResourceId
                firstName
                lastName
                email
                phone
              }
              shippingAddress {
                name
                firstName
                lastName
                phone
                address1
                city
                province
                zip
                country
              }
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      sku
                      price
                    }
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
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
      variables: { first, after },
    });

    const pageInfo = data?.orders?.pageInfo || { hasNextPage: false, endCursor: null };
    const edges = data?.orders?.edges || [];
    const nodes = edges.map((e) => {
      const node = e.node || {};
      const lineItemEdges = node.lineItems?.edges || [];
      const lineItems = lineItemEdges.map((le) => ({
        id: le.node?.id ? String(le.node.id).split('/').pop() : '',
        title: le.node?.title || 'Item',
        quantity: le.node?.quantity || 1,
        price: parseFloat(le.node?.originalUnitPriceSet?.shopMoney?.amount || le.node?.variant?.price || 0),
        sku: le.node?.variant?.sku || '',
        variant_id: le.node?.variant?.id ? String(le.node.variant.id).split('/').pop() : null,
        variant_title: le.node?.variant?.title || '',
      }));

      const rawId = node.legacyResourceId || (node.id ? String(node.id).split('/').pop() : '');
      const orderNum = node.name ? node.name.replace(/^#/, '') : rawId;

      return {
        cursor: e.cursor,
        id: rawId,
        graphql_id: node.id,
        order_number: orderNum,
        name: node.name,
        email: node.email || node.customer?.email || null,
        phone: node.phone || node.customer?.phone || node.shippingAddress?.phone || null,
        created_at: node.createdAt,
        cancelled_at: node.cancelledAt,
        currency: node.totalPriceSet?.shopMoney?.currencyCode || node.currencyCode || 'INR',
        financial_status: (node.displayFinancialStatus || '').toLowerCase(),
        fulfillment_status: (node.displayFulfillmentStatus || '').toLowerCase(),
        total_price: node.totalPriceSet?.shopMoney?.amount || '0.00',
        subtotal_price: node.subtotalPriceSet?.shopMoney?.amount || '0.00',
        total_discounts: node.totalDiscountsSet?.shopMoney?.amount || '0.00',
        total_tax: node.totalTaxSet?.shopMoney?.amount || '0.00',
        customer: node.customer ? {
          id: node.customer.legacyResourceId || (node.customer.id ? String(node.customer.id).split('/').pop() : ''),
          first_name: node.customer.firstName,
          last_name: node.customer.lastName,
          email: node.customer.email,
          phone: node.customer.phone,
        } : null,
        shipping_address: node.shippingAddress ? {
          name: node.shippingAddress.name,
          first_name: node.shippingAddress.firstName,
          last_name: node.shippingAddress.lastName,
          phone: node.shippingAddress.phone,
          address1: node.shippingAddress.address1,
          city: node.shippingAddress.city,
          province: node.shippingAddress.province,
          zip: node.shippingAddress.zip,
          country: node.shippingAddress.country,
        } : null,
        line_items: lineItems,
      };
    });

    return {
      nodes,
      pageInfo: {
        hasNextPage: !!pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor || null,
      },
    };
  },
};
