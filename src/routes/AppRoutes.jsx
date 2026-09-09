import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Features from '../pages/Features';
import Solutions from '../pages/Solutions';
import Pricing from '../pages/Pricing';
import Resources from '../pages/Resources';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import GoogleCallback from '../pages/GoogleCallback';
import Onboarding from '../pages/Onboarding';
import Step1Industry from '../pages/onboarding/Step1Industry';
import Step2Objectives from '../pages/onboarding/Step2Objectives';
import Step3Integrations from '../pages/onboarding/Step3Integrations';
import Step4Configuration from '../pages/onboarding/Step4Configuration';
import MetaWhatsAppOnboarding from '../pages/onboarding/MetaWhatsAppOnboarding';
import Dashboard from '../pages/Dashboard';
import Inbox from '../pages/Inbox';
import Campaigns from '../pages/Campaigns';
import CreateCampaign from '../pages/CreateCampaign';
import CampaignDetails from '../pages/CampaignDetails';
import CampaignReports from '../pages/CampaignReports';
import ConversationAnalyticsOverview from '../pages/ConversationAnalyticsOverview';
import AgentPerformance from '../pages/AgentPerformance';
import AdPerformance from '../pages/AdPerformance';
import CtwaFacebook from '../pages/CtwaFacebook';
import CreateFacebookPage from '../pages/CreateFacebookPage';
import ChatAssignment from '../pages/ChatAssignment';
import Contacts from '../pages/Contacts';

// Sales CRM Workspace Pages
import SalesPipeline from '../pages/SalesPipeline';
import SalesCrmReports from '../pages/SalesCrmReports';
import Tasks from '../pages/Tasks';

// WhatsApp Commerce Workspace Pages
import CommerceSettings from '../pages/CommerceSettings';
import CommerceCatalog from '../pages/CommerceCatalog';
import CheckoutBot from '../pages/CheckoutBot';
import OrderPanel from '../pages/OrderPanel';

import Templates from '../pages/Templates';
import NewTemplate from '../pages/NewTemplate';
import Segments from '../pages/Segments';
import Integrations from '../pages/Integrations';
import WhatsAppWidget from '../pages/WhatsAppWidget';

// Automation Workspace Pages (Interakt Replica Suite)
import BasicAutomations from '../pages/automation/BasicAutomations';
import CustomAutoReply from '../pages/automation/CustomAutoReply';
import Workflows from '../pages/automation/Workflows';
import AiIntentMatching from '../pages/automation/AiIntentMatching';
import WhatsAppAiAgent from '../pages/automation/WhatsAppAiAgent';
import InstagramQuickflows from '../pages/automation/InstagramQuickflows';
import VoiceAiCallGenie from '../pages/automation/VoiceAiCallGenie';
import WhatsAppForms from '../pages/automation/WhatsAppForms';
import InteractiveLists from '../pages/automation/InteractiveLists';

// Legal & Compliance Pages
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import TermsOfService from '../pages/legal/TermsOfService';
import DataDeletion from '../pages/legal/DataDeletion';

// 11 Dedicated Product Landing Pages
import WhatsAppMarketing from '../pages/products/WhatsAppMarketing';
import SalesCRM from '../pages/products/SalesCRM';
import CustomerSupport from '../pages/products/CustomerSupport';
import InstagramAutomation from '../pages/products/InstagramAutomation';
import AIAgents from '../pages/products/AIAgents';
import WhatsAppChatbots from '../pages/products/WhatsAppChatbots';
import WhatsAppCommerce from '../pages/products/WhatsAppCommerce';
import Automation from '../pages/products/Automation';
import Analytics from '../pages/products/Analytics';
import DeveloperPlatform from '../pages/products/DeveloperPlatform';
import VoiceAI from '../pages/products/VoiceAI';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone Authentication & Unified Meta WhatsApp Onboarding */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/onboarding/meta-whatsapp" element={<MetaWhatsAppOnboarding />} />
      <Route path="/auth/meta/callback" element={<Navigate to="/onboarding/meta-whatsapp" replace />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/onboarding/industry" element={<Step1Industry />} />
      <Route path="/onboarding/objectives" element={<Step2Objectives />} />
      <Route path="/onboarding/integrations" element={<Step3Integrations />} />
      <Route path="/onboarding/configuration" element={<Step4Configuration />} />
      
      {/* Core Workspace Hubs */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaigns/create" element={<CreateCampaign />} />
      <Route path="/notification" element={<Campaigns />} />
      <Route path="/notification/create-campaign" element={<CreateCampaign />} />
      <Route path="/campaigns/:id" element={<CampaignDetails />} />
      <Route path="/analytics/campaign-reports" element={<CampaignReports />} />
      <Route path="/market/campaign-reports" element={<Navigate to="/analytics/campaign-reports" replace />} />
      <Route path="/analytics/overview" element={<ConversationAnalyticsOverview />} />
      <Route path="/analytics/agent-performance" element={<AgentPerformance />} />
      <Route path="/analytics/ad-performance" element={<AdPerformance />} />
      <Route path="/ctwa/facebook" element={<CtwaFacebook />} />
      <Route path="/ctwa/facebook/create" element={<CreateFacebookPage />} />
      <Route path="/automation/chat-assignment" element={<ChatAssignment />} />
      <Route path="/chat-assignment" element={<Navigate to="/automation/chat-assignment" replace />} />
      <Route path="/contacts" element={<Contacts />} />

      {/* Sales CRM Workspace Routes */}
      <Route path="/sales-pipeline" element={<SalesPipeline />} />
      <Route path="/sales-crm-reports" element={<SalesCrmReports />} />
      <Route path="/sales-crm/reports" element={<Navigate to="/sales-crm-reports" replace />} />
      <Route path="/sales-crm-tasks" element={<Tasks />} />
      <Route path="/tasks" element={<Tasks />} />

      {/* WhatsApp Commerce Workspace Routes */}
      <Route path="/commerce-settings" element={<CommerceSettings />} />
      <Route path="/commerce/catalog" element={<CommerceCatalog />} />
      <Route path="/catalog" element={<Navigate to="/commerce/catalog" replace />} />
      <Route path="/checkout-bot" element={<CheckoutBot />} />
      <Route path="/work-flows/autocheckout" element={<Navigate to="/checkout-bot" replace />} />
      <Route path="/commerce/order-panel" element={<OrderPanel />} />
      <Route path="/order-panel" element={<Navigate to="/commerce/order-panel" replace />} />
      {/* Market Templates & Segments Workspace Routes */}
      <Route path="/templates/list" element={<Templates />} />
      <Route path="/templates/new" element={<NewTemplate />} />
      <Route path="/templates/:id/edit" element={<NewTemplate />} />
      <Route path="/templates/:id" element={<NewTemplate />} />
      <Route path="/templates" element={<Navigate to="/templates/list?channel_type=whatsapp&segment=library" replace />} />
      <Route path="/segments" element={<Segments />} />

      {/* Integrations Marketplace Route */}
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/onboarding/integrations-hub" element={<Navigate to="/integrations" replace />} />

      {/* WhatsApp Widget Workspace Routes */}
      <Route path="/widget" element={<WhatsAppWidget />} />
      <Route path="/widget/manage" element={<WhatsAppWidget />} />
      <Route path="/widget/install" element={<WhatsAppWidget />} />

      {/* Automation Workspace Routes (Interakt Functional Replica) */}
      <Route path="/automation/inbox-setting" element={<BasicAutomations />} />
      <Route path="/automation/inbox-settings" element={<Navigate to="/automation/inbox-setting" replace />} />
      <Route path="/automation/custom-reply" element={<CustomAutoReply />} />
      <Route path="/automation/custom-replies" element={<Navigate to="/automation/custom-reply" replace />} />
      <Route path="/automation/workflows" element={<Workflows />} />
      <Route path="/automation/workflows/:id" element={<Workflows />} />
      <Route path="/automation/ai-intent-matching" element={<AiIntentMatching />} />
      <Route path="/automation/ai-intent" element={<Navigate to="/automation/ai-intent-matching" replace />} />
      <Route path="/automation/whatsapp-ai-agent" element={<WhatsAppAiAgent />} />
      <Route path="/automation/quick-flows" element={<InstagramQuickflows />} />
      <Route path="/automation/quickflows" element={<Navigate to="/automation/quick-flows" replace />} />
      <Route path="/automation/my-call-genie" element={<VoiceAiCallGenie />} />
      <Route path="/automation/voice-ai" element={<Navigate to="/automation/my-call-genie" replace />} />
      <Route path="/automation/whatsapp-forms/view" element={<WhatsAppForms />} />
      <Route path="/automation/whatsapp-forms/create" element={<WhatsAppForms initialTab="create" />} />
      <Route path="/automation/whatsapp-forms" element={<Navigate to="/automation/whatsapp-forms/view" replace />} />
      <Route path="/automation/interactive-list" element={<InteractiveLists />} />
      <Route path="/automation/interaktive-list" element={<Navigate to="/automation/interactive-list" replace />} />
      <Route path="/automation" element={<Navigate to="/automation/inbox-setting" replace />} />

      {/* Main Website Pages with Navbar & Footer Layout */}
      <Route element={<MainLayout />}>
        {/* Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />

        {/* Legal & Meta Compliance Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        {/* 11 Dedicated Product Landing Pages */}
        <Route path="/products/whatsapp-marketing" element={<WhatsAppMarketing />} />
        <Route path="/products/sales-crm" element={<SalesCRM />} />
        <Route path="/products/customer-support" element={<CustomerSupport />} />
        <Route path="/products/instagram-automation" element={<InstagramAutomation />} />
        <Route path="/products/ai-agents" element={<AIAgents />} />
        <Route path="/products/whatsapp-chatbots" element={<WhatsAppChatbots />} />
        <Route path="/products/whatsapp-commerce" element={<WhatsAppCommerce />} />
        <Route path="/products/automation" element={<Automation />} />
        <Route path="/products/analytics" element={<Analytics />} />
        <Route path="/products/developer-platform" element={<DeveloperPlatform />} />
        <Route path="/products/voice-ai" element={<VoiceAI />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
