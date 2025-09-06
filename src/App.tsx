import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/components/theme-provider'; // Corrected import path and named import
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import UserManagement from '@/pages/UserManagement';
import CRM from '@/pages/CRM';
import SavedPropertiesPage from '@/pages/SavedPropertiesPage';
import FeaturedPropertiesPage from '@/pages/FeaturedPropertiesPage';
import MarketIntelligencePage from '@/pages/MarketIntelligencePage';
import PropertyVerificationPage from '@/pages/PropertyVerificationPage';
import ResearchReportsPage from '@/pages/ResearchReportsPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminTranslationsPage from '@/pages/AdminTranslationsPage';
import AdminMarketDataPage from '@/pages/AdminMarketDataPage';
import AdminMarketInsightsPage from '@/pages/AdminMarketInsightsPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminLeadsPage from '@/pages/AdminLeadsPage';
import AdminActivitiesPage from '@/pages/AdminActivitiesPage';
import AdminCredentialsPage from '@/pages/AdminCredentialsPage';
import AdminPropertyFormPage from '@/pages/AdminPropertyFormPage';
import AdminPropertyDetailsPage from '@/pages/AdminPropertyDetailsPage';
import AdminPropertyEditPage from '@/pages/AdminPropertyEditPage';
import AdminPropertyCreatePage from '@/pages/AdminPropertyCreatePage';
import AdminPropertyListingPage from '@/pages/AdminPropertyListingPage';
import AdminPropertyVerificationPage from '@/pages/AdminPropertyVerificationPage';
import AdminPropertyFeatureRequestsPage from '@/pages/AdminPropertyFeatureRequestsPage';
import AdminPropertyInquiriesPage from '@/pages/AdminPropertyInquiriesPage';
import AdminUserInquiriesPage from '@/pages/AdminUserInquiriesPage';
import AdminSearchHistoryPage from '@/pages/AdminSearchHistoryPage';
import AdminSavedPropertiesListingPage from '@/pages/AdminSavedPropertiesListingPage';
import AdminFeaturedPropertiesListingPage from '@/pages/AdminFeaturedPropertiesListingPage';
import AdminMarketIntelligenceListingPage from '@/pages/AdminMarketIntelligenceListingPage';
import AdminResearchReportsListingPage from '@/pages/AdminResearchReportsListingPage';
import AdminSiteSettingsPage from '@/pages/AdminSiteSettingsPage';
import AdminNotificationsPage from '@/pages/AdminNotificationsPage';
import AdminLeadNotesPage from '@/pages/AdminLeadNotesPage';
import AdminPhoneOTPsPage from '@/pages/AdminPhoneOTPsPage';
import AdminUserRolesPage from '@/pages/AdminUserRolesPage';
import AdminUserSecondaryContactsPage from '@/pages/AdminUserSecondaryContactsPage';
import AdminPropertyAnalyticsPage from '@/pages/AdminPropertyAnalyticsPage';
import AdminPropertyReportsPage from '@/pages/AdminPropertyReportsPage';
import AdminPropertyComparisonsPage from '@/pages/AdminPropertyComparisonsPage';
import AdminPropertyTrendsPage from '@/pages/AdminPropertyTrendsPage';
import AdminPropertyHeatmapPage from '@/pages/AdminPropertyHeatmapPage';
import AdminPropertyForecastPage from '@/pages/AdminPropertyForecastPage';
import AdminPropertyRecommendationsPage from '@/pages/AdminPropertyRecommendationsPage';
import AdminPropertyAlertsPage from '@/pages/AdminPropertyAlertsPage';
import AdminPropertyNotificationsPage from '@/pages/AdminPropertyNotificationsPage';
import AdminPropertyMessagesPage from '@/pages/AdminPropertyMessagesPage';
import AdminPropertyReviewsPage from '@/pages/AdminPropertyReviewsPage';
import AdminPropertyRatingsPage from '@/pages/AdminPropertyRatingsPage';
import AdminPropertyFeedbackPage from '@/pages/AdminPropertyFeedbackPage';
import AdminPropertySupportPage from '@/pages/AdminPropertySupportPage';
import AdminPropertyHelpPage from '@/pages/AdminPropertyHelpPage';
import AdminPropertyDocumentationPage from '@/pages/AdminPropertyDocumentationPage';
import AdminPropertyApiPage from '@/pages/AdminPropertyApiPage';
import AdminPropertyIntegrationsPage from '@/pages/AdminPropertyIntegrationsPage';
import AdminPropertyWebhooksPage from '@/pages/AdminPropertyWebhooksPage';
import AdminPropertyLogsPage from '@/pages/AdminPropertyLogsPage';
import AdminPropertyErrorsPage from '@/pages/AdminPropertyErrorsPage';
import AdminPropertyHealthPage from '@/pages/AdminPropertyHealthPage';
import AdminPropertyStatusPage from '@/pages/AdminPropertyStatusPage';
import AdminPropertyMaintenancePage from '@/pages/AdminPropertyMaintenancePage';
import AdminPropertyBackupPage from '@/pages/AdminPropertyBackupPage';
import AdminPropertyRestorePage from '@/pages/AdminPropertyRestorePage';
import AdminPropertyDeploymentsPage from '@/pages/AdminPropertyDeploymentsPage';
import AdminPropertyRollbacksPage from '@/pages/AdminPropertyRollbacksPage';
import AdminPropertyVersionsPage from '@/pages/AdminPropertyVersionsPage';
import AdminPropertyUpdatesPage from '@/pages/AdminPropertyUpdatesPage';
import AdminPropertyMigrationsPage from '@/pages/AdminPropertyMigrationsPage';
import AdminPropertySchemaPage from '@/pages/AdminPropertySchemaPage';
import AdminPropertyDatabasePage from '@/pages/AdminPropertyDatabasePage';
import AdminPropertyStoragePage from '@/pages/AdminPropertyStoragePage';
import AdminPropertyFunctionsPage from '@/pages/AdminPropertyFunctionsPage';
import AdminPropertyAuthPage from '@/pages/AdminPropertyAuthPage';
import AdminPropertyRealtimePage from '@/pages/AdminPropertyRealtimePage';
import AdminPropertyEdgeFunctionsPage from '@/pages/AdminPropertyEdgeFunctionsPage';
import AdminPropertySecretsPage from '@/pages/AdminPropertySecretsPage';
import AdminPropertyBillingPage from '@/pages/AdminPropertyBillingPage';
import AdminPropertyUsagePage from '@/pages/AdminPropertyUsagePage';
import AdminPropertySettingsPage from '@/pages/AdminPropertySettingsPage';
import AdminPropertyAccountPage from '@/pages/AdminPropertyAccountPage';
import AdminPropertyProfilePage from '@/pages/AdminPropertyProfilePage';
import AdminPropertySecurityPage from '@/pages/AdminPropertySecurityPage';
import AdminPropertyNotificationsSettingsPage from '@/pages/AdminPropertyNotificationsSettingsPage';
import AdminPropertyEmailSettingsPage from '@/pages/AdminPropertyEmailSettingsPage';
import AdminPropertySmsSettingsPage from '@/pages/AdminPropertySmsSettingsPage';
import AdminPropertyPushSettingsPage from '@/pages/AdminPropertyPushSettingsPage';
import AdminPropertyIntegrationsSettingsPage from '@/pages/AdminPropertyIntegrationsSettingsPage';
import AdminPropertyApiKeysSettingsPage from '@/pages/AdminPropertyApiKeysSettingsPage';
import AdminPropertyWebhooksSettingsPage from '@/pages/AdminPropertyWebhooksSettingsPage';
import AdminPropertyLogsSettingsPage from '@/pages/AdminPropertyLogsSettingsPage';
import AdminPropertyErrorsSettingsPage from '@/pages/AdminPropertyErrorsSettingsPage';
import AdminPropertyHealthSettingsPage from '@/pages/AdminPropertyHealthSettingsPage';
import AdminPropertyStatusSettingsPage from '@/pages/AdminPropertyStatusSettingsPage';
import AdminPropertyMaintenanceSettingsPage from '@/pages/AdminPropertyMaintenanceSettingsPage';
import AdminPropertyBackupSettingsPage from '@/pages/AdminPropertyBackupSettingsPage';
import AdminPropertyRestoreSettingsPage from '@/pages/AdminPropertyRestoreSettingsPage';
import AdminPropertyDeploymentsSettingsPage from '@/pages/AdminPropertyDeploymentsSettingsPage';
import AdminPropertyRollbacksSettingsPage from '@/pages/AdminPropertyRollbacksSettingsPage';
import AdminPropertyVersionsSettingsPage from '@/pages/AdminPropertyVersionsSettingsPage';
import AdminPropertyUpdatesSettingsPage from '@/pages/AdminPropertyUpdatesSettingsPage';
import AdminPropertyMigrationsSettingsPage from '@/pages/AdminPropertyMigrationsSettingsPage';
import AdminPropertySchemaSettingsPage from '@/pages/AdminPropertySchemaSettingsPage';
import AdminPropertyDatabaseSettingsPage from '@/pages/AdminPropertyDatabaseSettingsPage';
import AdminPropertyStorageSettingsPage from '@/pages/AdminPropertyStorageSettingsPage';
import AdminPropertyFunctionsSettingsPage from '@/pages/AdminPropertyFunctionsSettingsPage';
import AdminPropertyAuthSettingsPage from '@/pages/AdminPropertyAuthSettingsPage';
import AdminPropertyRealtimeSettingsPage from '@/pages/AdminPropertyRealtimeSettingsPage';
import AdminPropertyEdgeFunctionsSettingsPage from '@/pages/AdminPropertyEdgeFunctionsSettingsPage';
import AdminPropertySecretsSettingsPage from '@/pages/AdminPropertySecretsSettingsPage';
import AdminPropertyBillingSettingsPage from '@/pages/AdminPropertyBillingSettingsPage';
import AdminPropertyUsageSettingsPage from '@/pages/AdminPropertyUsageSettingsPage';
import AdminPropertySettingsSettingsPage from '@/pages/AdminPropertySettingsSettingsPage';
import AdminPropertyAccountSettingsPage from '@/pages/AdminPropertyAccountSettingsPage';
import AdminPropertyProfileSettingsPage from '@/pages/AdminPropertyProfileSettingsPage';
import AdminPropertySecuritySettingsPage from '@/pages/AdminPropertySecuritySettingsPage';
import AdminPropertyNotificationsManagementPage from '@/pages/AdminPropertyNotificationsManagementPage';
import AdminPropertyEmailManagementPage from '@/pages/AdminPropertyEmailManagementPage';
import AdminPropertySmsManagementPage from '@/pages/AdminPropertySmsManagementPage';
import AdminPropertyPushManagementPage from '@/pages/AdminPropertyPushManagementPage';
import AdminPropertyIntegrationsManagementPage from '@/pages/AdminPropertyIntegrationsManagementPage';
import AdminPropertyApiKeysManagementPage from '@/pages/AdminPropertyApiKeysManagementPage';
import AdminPropertyWebhooksManagementPage from '@/pages/AdminPropertyWebhooksManagementPage';
import AdminPropertyLogsManagementPage from '@/pages/AdminPropertyLogsManagementPage';
import AdminPropertyErrorsManagementPage from '@/pages/AdminPropertyErrorsManagementPage';
import AdminPropertyHealthManagementPage from '@/pages/AdminPropertyHealthManagementPage';
import AdminPropertyStatusManagementPage from '@/pages/AdminPropertyStatusManagementPage';
import AdminPropertyMaintenanceManagementPage from '@/pages/AdminPropertyMaintenanceManagementPage';
import AdminPropertyBackupManagementPage from '@/pages/AdminPropertyBackupManagementPage';
import AdminPropertyRestoreManagementPage from '@/pages/AdminPropertyRestoreManagementPage';
import AdminPropertyDeploymentsManagementPage from '@/pages/AdminPropertyDeploymentsManagementPage';
import AdminPropertyRollbacksManagementPage from '@/pages/AdminPropertyRollbacksManagementPage';
import AdminPropertyVersionsManagementPage from '@/pages/AdminPropertyVersionsManagementPage';
import AdminPropertyUpdatesManagementPage from '@/pages/AdminPropertyUpdatesManagementPage';
import AdminPropertyMigrationsManagementPage from '@/pages/AdminPropertyMigrationsManagementPage';
import AdminPropertySchemaManagementPage from '@/pages/AdminPropertySchemaManagementPage';
import AdminPropertyDatabaseManagementPage from '@/pages/AdminPropertyDatabaseManagementPage';
import AdminPropertyStorageManagementPage from '@/pages/AdminPropertyStorageManagementPage';
import AdminPropertyFunctionsManagementPage from '@/pages/AdminPropertyFunctionsManagementPage';
import AdminPropertyAuthManagementPage from '@/pages/AdminPropertyAuthManagementPage';
import AdminPropertyRealtimeManagementPage from '@/pages/AdminPropertyRealtimeManagementPage';
import AdminPropertyEdgeFunctionsManagementPage from '@/pages/AdminPropertyEdgeFunctionsManagementPage';
import AdminPropertySecretsManagementPage from '@/pages/AdminPropertySecretsManagementPage';
import AdminPropertyBillingManagementPage from '@/pages/AdminPropertyBillingManagementPage';
import AdminPropertyUsageManagementPage from '@/pages/AdminPropertyUsageManagementPage';
import AdminPropertySettingsManagementPage from '@/pages/AdminPropertySettingsManagementPage';
import AdminPropertyAccountManagementPage from '@/pages/AdminPropertyAccountManagementPage';
import AdminPropertyProfileManagementPage from '@/pages/AdminPropertyProfileManagementPage';
import AdminPropertySecurityManagementPage from '@/pages/AdminPropertySecurityManagementPage';
import AdminPropertyNotificationsHistoryPage from '@/pages/AdminPropertyNotificationsHistoryPage';
import AdminPropertyEmailHistoryPage from '@/pages/AdminPropertyEmailHistoryPage';
import AdminPropertySmsHistoryPage from '@/pages/AdminPropertySmsHistoryPage';
import AdminPropertyPushHistoryPage from '@/pages/AdminPropertyPushHistoryPage';
import AdminPropertyIntegrationsHistoryPage from '@/pages/AdminPropertyIntegrationsHistoryPage';
import AdminPropertyApiKeysHistoryPage from '@/pages/AdminPropertyApiKeysHistoryPage';
import AdminPropertyWebhooksHistoryPage from '@/pages/AdminPropertyWebhooksHistoryPage';
import AdminPropertyLogsHistoryPage from '@/pages/AdminPropertyLogsHistoryPage';
import AdminPropertyErrorsHistoryPage from '@/pages/AdminPropertyErrorsHistoryPage';
import AdminPropertyHealthHistoryPage from '@/pages/AdminPropertyHealthHistoryPage';
import AdminPropertyStatusHistoryPage from '@/pages/AdminPropertyStatusHistoryPage';
import AdminPropertyMaintenanceHistoryPage from '@/pages/AdminPropertyMaintenanceHistoryPage';
import AdminPropertyBackupHistoryPage from '@/pages/AdminPropertyBackupHistoryPage';
import AdminPropertyRestoreHistoryPage from '@/pages/AdminPropertyRestoreHistoryPage';
import AdminPropertyDeploymentsHistoryPage from '@/pages/AdminPropertyDeploymentsHistoryPage';
import AdminPropertyRollbacksHistoryPage from '@/pages/AdminPropertyRollbacksHistoryPage';
import AdminPropertyVersionsHistoryPage from '@/pages/AdminPropertyVersionsHistoryPage';
import AdminPropertyUpdatesHistoryPage from '@/pages/AdminPropertyUpdatesHistoryPage';
import AdminPropertyMigrationsHistoryPage from '@/pages/AdminPropertyMigrationsHistoryPage';
import AdminPropertySchemaHistoryPage from '@/pages/AdminPropertySchemaHistoryPage';
import AdminPropertyDatabaseHistoryPage from '@/pages/AdminPropertyDatabaseHistoryPage';
import AdminPropertyStorageHistoryPage from '@/pages/AdminPropertyStorageHistoryPage';
import AdminPropertyFunctionsHistoryPage from '@/pages/AdminPropertyFunctionsHistoryPage';
import AdminPropertyAuthHistoryPage from '@/pages/AdminPropertyAuthHistoryPage';
import AdminPropertyRealtimeHistoryPage from '@/pages/AdminPropertyRealtimeHistoryPage';
import AdminPropertyEdgeFunctionsHistoryPage from '@/pages/AdminPropertyEdgeFunctionsHistoryPage';
import AdminPropertySecretsHistoryPage from '@/pages/AdminPropertySecretsHistoryPage';
import AdminPropertyBillingHistoryPage from '@/pages/AdminPropertyBillingHistoryPage';
import AdminPropertyUsageHistoryPage from '@/pages/AdminPropertyUsageHistoryPage';
import AdminPropertySettingsHistoryPage from '@/pages/AdminPropertySettingsHistoryPage';
import AdminPropertyAccountHistoryPage from '@/pages/AdminPropertyAccountHistoryPage';
import AdminPropertyProfileHistoryPage from '@/pages/AdminPropertyProfileHistoryPage';
import AdminPropertySecurityHistoryPage from '@/pages/AdminPropertySecurityHistoryPage';
import AdminPropertyNotificationsReportsPage from '@/pages/AdminPropertyNotificationsReportsPage';
import AdminPropertyEmailReportsPage from '@/pages/AdminPropertyEmailReportsPage';
import AdminPropertySmsReportsPage from '@/pages/AdminPropertySmsReportsPage';
import AdminPropertyPushReportsPage from '@/pages/AdminPropertyPushReportsPage';
import AdminPropertyIntegrationsReportsPage from '@/pages/AdminPropertyIntegrationsReportsPage';
import AdminPropertyApiKeysReportsPage from '@/pages/AdminPropertyApiKeysReportsPage';
import AdminPropertyWebhooksReportsPage from '@/pages/AdminPropertyWebhooksReportsPage';
import AdminPropertyLogsReportsPage from '@/pages/AdminPropertyLogsReportsPage';
import AdminPropertyErrorsReportsPage from '@/pages/AdminPropertyErrorsReportsPage';
import AdminPropertyHealthReportsPage from '@/pages/AdminPropertyHealthReportsPage';
import AdminPropertyStatusReportsPage from '@/pages/AdminPropertyStatusReportsPage';
import AdminPropertyMaintenanceReportsPage from '@/pages/AdminPropertyMaintenanceReportsPage';
import AdminPropertyBackupReportsPage from '@/pages/AdminPropertyBackupReportsPage';
import AdminPropertyRestoreReportsPage from '@/pages/AdminPropertyRestoreReportsPage';
import AdminPropertyDeploymentsReportsPage from '@/pages/AdminPropertyDeploymentsReportsPage';
import AdminPropertyRollbacksReportsPage from '@/pages/AdminPropertyRollbacksReportsPage';
import AdminPropertyVersionsReportsPage from '@/pages/AdminPropertyVersionsReportsPage';
import AdminPropertyUpdatesReportsPage from '@/pages/AdminPropertyUpdatesReportsPage';
import AdminPropertyMigrationsReportsPage from '@/pages/AdminPropertyMigrationsReportsPage';
import AdminPropertySchemaReportsPage from '@/pages/AdminPropertySchemaReportsPage';
import AdminPropertyDatabaseReportsPage from '@/pages/AdminPropertyDatabaseReportsPage';
import AdminPropertyStorageReportsPage from '@/pages/AdminPropertyStorageReportsPage';
import AdminPropertyFunctionsReportsPage from '@/pages/AdminPropertyFunctionsReportsPage';
import AdminPropertyAuthReportsPage from '@/pages/AdminPropertyAuthReportsPage';
import AdminPropertyRealtimeReportsPage from '@/pages/AdminPropertyRealtimeReportsPage';
import AdminPropertyEdgeFunctionsReportsPage from '@/pages/AdminPropertyEdgeFunctionsReportsPage';
import AdminPropertySecretsReportsPage from '@/pages/AdminPropertySecretsReportsPage';
import AdminPropertyBillingReportsPage from '@/pages/AdminPropertyBillingReportsPage';
import AdminPropertyUsageReportsPage from '@/pages/AdminPropertyUsageReportsPage';
import AdminPropertySettingsReportsPage from '@/pages/AdminPropertySettingsReportsPage';
import AdminPropertyAccountReportsPage from '@/pages/AdminPropertyAccountReportsPage';
import AdminPropertyProfileReportsPage from '@/pages/AdminPropertyProfileReportsPage';
import AdminPropertySecurityReportsPage from '@/pages/AdminPropertySecurityReportsPage';
import AdminPropertyNotificationsAnalyticsPage from '@/pages/AdminPropertyNotificationsAnalyticsPage';
import AdminPropertyEmailAnalyticsPage from '@/pages/AdminPropertyEmailAnalyticsPage';
import AdminPropertySmsAnalyticsPage from '@/pages/AdminPropertySmsAnalyticsPage';
import AdminPropertyPushAnalyticsPage from '@/pages/AdminPropertyPushAnalyticsPage';
import AdminPropertyIntegrationsAnalyticsPage from '@/pages/AdminPropertyIntegrationsAnalyticsPage';
import AdminPropertyApiKeysAnalyticsPage from '@/pages/AdminPropertyApiKeysAnalyticsPage';
import AdminPropertyWebhooksAnalyticsPage from '@/pages/AdminPropertyWebhooksAnalyticsPage';
import AdminPropertyLogsAnalyticsPage from '@/pages/AdminPropertyLogsAnalyticsPage';
import AdminPropertyErrorsAnalyticsPage from '@/pages/AdminPropertyErrorsAnalyticsPage';
import AdminPropertyHealthAnalyticsPage from '@/pages/AdminPropertyHealthAnalyticsPage';
import AdminPropertyStatusAnalyticsPage from '@/pages/AdminPropertyStatusAnalyticsPage';
import AdminPropertyMaintenanceAnalyticsPage from '@/pages/AdminPropertyMaintenanceAnalyticsPage';
import AdminPropertyBackupAnalyticsPage from '@/pages/AdminPropertyBackupAnalyticsPage';
import AdminPropertyRestoreAnalyticsPage from '@/pages/AdminPropertyRestoreAnalyticsPage';
import AdminPropertyDeploymentsAnalyticsPage from '@/pages/AdminPropertyDeploymentsAnalyticsPage';
import AdminPropertyRollbacksAnalyticsPage from '@/pages/AdminPropertyRollbacksAnalyticsPage';
import AdminPropertyVersionsAnalyticsPage from '@/pages/AdminPropertyVersionsAnalyticsPage';
import AdminPropertyUpdatesAnalyticsPage from '@/pages/AdminPropertyUpdatesAnalyticsPage';
import AdminPropertyMigrationsAnalyticsPage from '@/pages/AdminPropertyMigrationsAnalyticsPage';
import AdminPropertySchemaAnalyticsPage from '@/pages/AdminPropertySchemaAnalyticsPage';
import AdminPropertyDatabaseAnalyticsPage from '@/pages/AdminPropertyDatabaseAnalyticsPage';
import AdminPropertyStorageAnalyticsPage from '@/pages/AdminPropertyStorageAnalyticsPage';
import AdminPropertyFunctionsAnalyticsPage from '@/pages/AdminPropertyFunctionsAnalyticsPage';
import AdminPropertyAuthAnalyticsPage from '@/pages/AdminPropertyAuthAnalyticsPage';
import AdminPropertyRealtimeAnalyticsPage from '@/pages/AdminPropertyRealtimeAnalyticsPage';
import AdminPropertyEdgeFunctionsAnalyticsPage from '@/pages/AdminPropertyEdgeFunctionsAnalyticsPage';
import AdminPropertySecretsAnalyticsPage from '@/pages/AdminPropertySecretsAnalyticsPage';
import AdminPropertyBillingAnalyticsPage from '@/pages/AdminPropertyBillingAnalyticsPage';
import AdminPropertyUsageAnalyticsPage from '@/pages/AdminPropertyUsageAnalyticsPage';
import AdminPropertySettingsAnalyticsPage from '@/pages/AdminPropertySettingsAnalyticsPage';
import AdminPropertyAccountAnalyticsPage from '@/pages/AdminPropertyAccountAnalyticsPage';
import AdminPropertyProfileAnalyticsPage from '@/pages/AdminPropertyProfileAnalyticsPage';
import AdminPropertySecurityAnalyticsPage from '@/pages/AdminPropertySecurityAnalyticsPage';
import AdminPropertyNotificationsDashboardPage from '@/pages/AdminPropertyNotificationsDashboardPage';
import AdminPropertyEmailDashboardPage from '@/pages/AdminPropertyEmailDashboardPage';
import AdminPropertySmsDashboardPage from '@/pages/AdminPropertySmsDashboardPage';
import AdminPropertyPushDashboardPage from '@/pages/AdminPropertyPushDashboardPage';
import AdminPropertyIntegrationsDashboardPage from '@/pages/AdminPropertyIntegrationsDashboardPage';
import AdminPropertyApiKeysDashboardPage from '@/pages/AdminPropertyApiKeysDashboardPage';
import AdminPropertyWebhooksDashboardPage from '@/pages/AdminPropertyWebhooksDashboardPage';
import AdminPropertyLogsDashboardPage from '@/pages/AdminPropertyLogsDashboardPage';
import AdminPropertyErrorsDashboardPage from '@/pages/AdminPropertyErrorsDashboardPage';
import AdminPropertyHealthDashboardPage from '@/pages/AdminPropertyHealthDashboardPage';
import AdminPropertyStatusDashboardPage from '@/pages/AdminPropertyStatusDashboardPage';
import AdminPropertyMaintenanceDashboardPage from '@/pages/AdminPropertyMaintenanceDashboardPage';
import AdminPropertyBackupDashboardPage from '@/pages/AdminPropertyBackupDashboardPage';
import AdminPropertyRestoreDashboardPage from '@/pages/AdminPropertyRestoreDashboardPage';
import AdminPropertyDeploymentsDashboardPage from '@/pages/AdminPropertyDeploymentsDashboardPage';
import AdminPropertyRollbacksDashboardPage from '@/pages/AdminPropertyRollbacksDashboardPage';
import AdminPropertyVersionsDashboardPage from '@/pages/AdminPropertyVersionsDashboardPage';
import AdminPropertyUpdatesDashboardPage from '@/pages/AdminPropertyUpdatesDashboardPage';
import AdminPropertyMigrationsDashboardPage from '@/pages/AdminPropertyMigrationsDashboardPage';
import AdminPropertySchemaDashboardPage from '@/pages/AdminPropertySchemaDashboardPage';
import AdminPropertyDatabaseDashboardPage from '@/pages/AdminPropertyDatabaseDashboardPage';
import AdminPropertyStorageDashboardPage from '@/pages/AdminPropertyStorageDashboardPage';
import AdminPropertyFunctionsDashboardPage from '@/pages/AdminPropertyFunctionsDashboardPage';
import AdminPropertyAuthDashboardPage from '@/pages/AdminPropertyAuthDashboardPage';
import AdminPropertyRealtimeDashboardPage from '@/pages/AdminPropertyRealtimeDashboardPage';
import AdminPropertyEdgeFunctionsDashboardPage from '@/pages/AdminPropertyEdgeFunctionsDashboardPage';
import AdminPropertySecretsDashboardPage from '@/pages/AdminPropertySecretsDashboardPage';
import AdminPropertyBillingDashboardPage from '@/pages/AdminPropertyBillingDashboardPage';
import AdminPropertyUsageDashboardPage from '@/pages/AdminPropertyUsageDashboardPage';
import AdminPropertySettingsDashboardPage from '@/pages/AdminPropertySettingsDashboardPage';
import AdminPropertyAccountDashboardPage from '@/pages/AdminPropertyAccountDashboardPage';
import AdminPropertyProfileDashboardPage from '@/pages/AdminPropertyProfileDashboardPage';
import AdminPropertySecurityDashboardPage from '@/pages/AdminPropertySecurityDashboardPage';
import AdminPropertyNotificationsOverviewPage from '@/pages/AdminPropertyNotificationsOverviewPage';
import AdminPropertyEmailOverviewPage from '@/pages/AdminPropertyEmailOverviewPage';
import AdminPropertySmsOverviewPage from '@/pages/AdminPropertySmsOverviewPage';
import AdminPropertyPushOverviewPage from '@/pages/AdminPropertyPushOverviewPage';
import AdminPropertyIntegrationsOverviewPage from '@/pages/AdminPropertyIntegrationsOverviewPage';
import AdminPropertyApiKeysOverviewPage from '@/pages/AdminPropertyApiKeysOverviewPage';
import AdminPropertyWebhooksOverviewPage from '@/pages/AdminPropertyWebhooksOverviewPage';
import AdminPropertyLogsOverviewPage from '@/pages/AdminPropertyLogsOverviewPage';
import AdminPropertyErrorsOverviewPage from '@/pages/AdminPropertyErrorsOverviewPage';
import AdminPropertyHealthOverviewPage from '@/pages/AdminPropertyHealthOverviewPage';
import AdminPropertyStatusOverviewPage from '@/pages/AdminPropertyStatusOverviewPage';
import AdminPropertyMaintenanceOverviewPage from '@/pages/AdminPropertyMaintenanceOverviewPage';
import AdminPropertyBackupOverviewPage from '@/pages/AdminPropertyBackupOverviewPage';
import AdminPropertyRestoreOverviewPage from '@/pages/AdminPropertyRestoreOverviewPage';
import AdminPropertyDeploymentsOverviewPage from '@/pages/AdminPropertyDeploymentsOverviewPage';
import AdminPropertyRollbacksOverviewPage from '@/pages/AdminPropertyRollbacksOverviewPage';
import AdminPropertyVersionsOverviewPage from '@/pages/AdminPropertyVersionsOverviewPage';
import AdminPropertyUpdatesOverviewPage from '@/pages/AdminPropertyUpdatesOverviewPage';
import AdminPropertyMigrationsOverviewPage from '@/pages/AdminPropertyMigrationsOverviewPage';
import AdminPropertySchemaOverviewPage from '@/pages/AdminPropertySchemaOverviewPage';
import AdminPropertyDatabaseOverviewPage from '@/pages/AdminPropertyDatabaseOverviewPage';
import AdminPropertyStorageOverviewPage from '@/pages/AdminPropertyStorageOverviewPage';
import AdminPropertyFunctionsOverviewPage from '@/pages/AdminPropertyFunctionsOverviewPage';
import AdminPropertyAuthOverviewPage from '@/pages/AdminPropertyAuthOverviewPage';
import AdminPropertyRealtimeOverviewPage from '@/pages/AdminPropertyRealtimeOverviewPage';
import AdminPropertyEdgeFunctionsOverviewPage from '@/pages/AdminPropertyEdgeFunctionsOverviewPage';
import AdminPropertySecretsOverviewPage from '@/pages/AdminPropertySecretsOverviewPage';
import AdminPropertyBillingOverviewPage from '@/pages/AdminPropertyBillingOverviewPage';
import AdminPropertyUsageOverviewPage from '@/pages/AdminPropertyUsageOverviewPage';
import AdminPropertySettingsOverviewPage from '@/pages/AdminPropertySettingsOverviewPage';
import AdminPropertyAccountOverviewPage from '@/pages/AdminPropertyAccountOverviewPage';
import AdminPropertyProfileOverviewPage from '@/pages/AdminPropertyProfileOverviewPage';
import AdminPropertySecurityOverviewPage from '@/pages/AdminPropertySecurityOverviewPage';
import AdminPropertyNotificationsConfigurationPage from '@/pages/AdminPropertyNotificationsConfigurationPage';
import AdminPropertyEmailConfigurationPage from '@/pages/AdminPropertyEmailConfigurationPage';
import AdminPropertySmsConfigurationPage from '@/pages/AdminPropertySmsConfigurationPage';
import AdminPropertyPushConfigurationPage from '@/pages/AdminPropertyPushConfigurationPage';
import AdminPropertyIntegrationsConfigurationPage from '@/pages/AdminPropertyIntegrationsConfigurationPage';
import AdminPropertyApiKeysConfigurationPage from '@/pages/AdminPropertyApiKeysConfigurationPage';
import AdminPropertyWebhooksConfigurationPage from '@/pages/AdminPropertyWebhooksConfigurationPage';
import AdminPropertyLogsConfigurationPage from '@/pages/AdminPropertyLogsConfigurationPage';
import AdminPropertyErrorsConfigurationPage from '@/pages/AdminPropertyErrorsConfigurationPage';
import AdminPropertyHealthConfigurationPage from '@/pages/AdminPropertyHealthConfigurationPage';
import AdminPropertyStatusConfigurationPage from '@/pages/AdminPropertyStatusConfigurationPage';
import AdminPropertyMaintenanceConfigurationPage from '@/pages/AdminPropertyMaintenanceConfigurationPage';
import AdminPropertyBackupConfigurationPage from '@/pages/AdminPropertyBackupConfigurationPage';
import AdminPropertyRestoreConfigurationPage from '@/pages/AdminPropertyRestoreConfigurationPage';
import AdminPropertyDeploymentsConfigurationPage from '@/pages/AdminPropertyDeploymentsConfigurationPage';
import AdminPropertyRollbacksConfigurationPage from '@/pages/AdminPropertyRollbacksConfigurationPage';
import AdminPropertyVersionsConfigurationPage from '@/pages/AdminPropertyVersionsConfigurationPage';
import AdminPropertyUpdatesConfigurationPage from '@/pages/AdminPropertyUpdatesConfigurationPage';
import AdminPropertyMigrationsConfigurationPage from '@/pages/AdminPropertyMigrationsConfigurationPage';
import AdminPropertySchemaConfigurationPage from '@/pages/AdminPropertySchemaConfigurationPage';
import AdminPropertyDatabaseConfigurationPage from '@/pages/AdminPropertyDatabaseConfigurationPage';
import AdminPropertyStorageConfigurationPage from '@/pages/AdminPropertyStorageConfigurationPage';
import AdminPropertyFunctionsConfigurationPage from '@/pages/AdminPropertyFunctionsConfigurationPage';
import AdminPropertyAuthConfigurationPage from '@/pages/AdminPropertyAuthConfigurationPage';
import AdminPropertyRealtimeConfigurationPage from '@/pages/AdminPropertyRealtimeConfigurationPage';
import AdminPropertyEdgeFunctionsConfigurationPage from '@/pages/AdminPropertyEdgeFunctionsConfigurationPage';
import AdminPropertySecretsConfigurationPage from '@/pages/AdminPropertySecretsConfigurationPage';
import AdminPropertyBillingConfigurationPage from '@/pages/AdminPropertyBillingConfigurationPage';
import AdminPropertyUsageConfigurationPage from '@/pages/AdminPropertyUsageConfigurationPage';
import AdminPropertySettingsConfigurationPage from '@/pages/AdminPropertySettingsConfigurationPage';
import AdminPropertyAccountConfigurationPage from '@/pages/AdminPropertyAccountConfigurationPage';
import AdminPropertyProfileConfigurationPage from '@/pages/AdminPropertyProfileConfigurationPage';
import AdminPropertySecurityConfigurationPage from '@/pages/AdminPropertySecurityConfigurationPage';
import AdminPropertyNotificationsAlertsPage from '@/pages/AdminPropertyNotificationsAlertsPage';
import AdminPropertyEmailAlertsPage from '@/pages/AdminPropertyEmailAlertsPage';
import AdminPropertySmsAlertsPage from '@/pages/AdminPropertySmsAlertsPage';
import AdminPropertyPushAlertsPage from '@/pages/AdminPropertyPushAlertsPage';
import AdminPropertyIntegrationsAlertsPage from '@/pages/AdminPropertyIntegrationsAlertsPage';
import AdminPropertyApiKeysAlertsPage from '@/pages/AdminPropertyApiKeysAlertsPage';
import AdminPropertyWebhooksAlertsPage from '@/pages/AdminPropertyWebhooksAlertsPage';
import AdminPropertyLogsAlertsPage from '@/pages/AdminPropertyLogsAlertsPage';
import AdminPropertyErrorsAlertsPage from '@/pages/AdminPropertyErrorsAlertsPage';
import AdminPropertyHealthAlertsPage from '@/pages/AdminPropertyHealthAlertsPage';
import AdminPropertyStatusAlertsPage from '@/pages/AdminPropertyStatusAlertsPage';
import AdminPropertyMaintenanceAlertsPage from '@/pages/AdminPropertyMaintenanceAlertsPage';
import AdminPropertyBackupAlertsPage from '@/pages/AdminPropertyBackupAlertsPage';
import AdminPropertyRestoreAlertsPage from '@/pages/AdminPropertyRestoreAlertsPage';
import AdminPropertyDeploymentsAlertsPage from '@/pages/AdminPropertyDeploymentsAlertsPage';
import AdminPropertyRollbacksAlertsPage from '@/pages/AdminPropertyRollbacksAlertsPage';
import AdminPropertyVersionsAlertsPage from '@/pages/AdminPropertyVersionsAlertsPage';
import AdminPropertyUpdatesAlertsPage from '@/pages/AdminPropertyUpdatesAlertsPage';
import AdminPropertyMigrationsAlertsPage from '@/pages/AdminPropertyMigrationsAlertsPage';
import AdminPropertySchemaAlertsPage from '@/pages/AdminPropertySchemaAlertsPage';
import AdminPropertyDatabaseAlertsPage from '@/pages/AdminPropertyDatabaseAlertsPage';
import AdminPropertyStorageAlertsPage from '@/pages/AdminPropertyStorageAlertsPage';
import AdminPropertyFunctionsAlertsPage from '@/pages/AdminPropertyFunctionsAlertsPage';
import AdminPropertyAuthAlertsPage from '@/pages/AdminPropertyAuthAlertsPage';
import AdminPropertyRealtimeAlertsPage from '@/pages/AdminPropertyRealtimeAlertsPage';
import AdminPropertyEdgeFunctionsAlertsPage from '@/pages/AdminPropertyEdgeFunctionsAlertsPage';
import AdminPropertySecretsAlertsPage from '@/pages/AdminPropertySecretsAlertsPage';
import AdminPropertyBillingAlertsPage from '@/pages/AdminPropertyBillingAlertsPage';
import AdminPropertyUsageAlertsPage from '@/pages/AdminPropertyUsageAlertsPage';
import AdminPropertySettingsAlertsPage from '@/pages/AdminPropertySettingsAlertsPage';
import AdminPropertyAccountAlertsPage from '@/pages/AdminPropertyAccountAlertsPage';
import AdminPropertyProfileAlertsPage from '@/pages/AdminPropertyProfileAlertsPage';
import AdminPropertySecurityAlertsPage from '@/pages/AdminPropertySecurityAlertsPage';
import AdminPropertyNotificationsReportsConfigurationPage from '@/pages/AdminPropertyNotificationsReportsConfigurationPage';
import AdminPropertyEmailReportsConfigurationPage from '@/pages/AdminPropertyEmailReportsConfigurationPage';
import AdminPropertySmsReportsConfigurationPage from '@/pages/AdminPropertySmsReportsConfigurationPage';
import AdminPropertyPushReportsConfigurationPage from '@/pages/AdminPropertyPushReportsConfigurationPage';
import AdminPropertyIntegrationsReportsConfigurationPage from '@/pages/AdminPropertyIntegrationsReportsConfigurationPage';
import AdminPropertyApiKeysReportsConfigurationPage from '@/pages/AdminPropertyApiKeysReportsConfigurationPage';
import AdminPropertyWebhooksReportsConfigurationPage from '@/pages/AdminPropertyWebhooksReportsConfigurationPage';
import AdminPropertyLogsReportsConfigurationPage from '@/pages/AdminPropertyLogsReportsConfigurationPage';
import AdminPropertyErrorsReportsConfigurationPage from '@/pages/AdminPropertyErrorsReportsConfigurationPage';
import AdminPropertyHealthReportsConfigurationPage from '@/pages/AdminPropertyHealthReportsConfigurationPage';
import AdminPropertyStatusReportsConfigurationPage from '@/pages/AdminPropertyStatusReportsConfigurationPage';
import AdminPropertyMaintenanceReportsConfigurationPage from '@/pages/AdminPropertyMaintenanceReportsConfigurationPage';
import AdminPropertyBackupReportsConfigurationPage from '@/pages/AdminPropertyBackupReportsConfigurationPage';
import AdminPropertyRestoreReportsConfigurationPage from '@/pages/AdminPropertyRestoreReportsConfigurationPage';
import AdminPropertyDeploymentsReportsConfigurationPage from '@/pages/AdminPropertyDeploymentsReportsConfigurationPage';
import AdminPropertyRollbacksReportsConfigurationPage from '@/pages/AdminPropertyRollbacksReportsConfigurationPage';
import AdminPropertyVersionsReportsConfigurationPage from '@/pages/AdminPropertyVersionsReportsConfigurationPage';
import AdminPropertyUpdatesReportsConfigurationPage from '@/pages/AdminPropertyUpdatesReportsConfigurationPage';
import AdminPropertyMigrationsReportsConfigurationPage from '@/pages/AdminPropertyMigrationsReportsConfigurationPage';
import AdminPropertySchemaReportsConfigurationPage from '@/pages/AdminPropertySchemaReportsConfigurationPage';
import AdminPropertyDatabaseReportsConfigurationPage from '@/pages/AdminPropertyDatabaseReportsConfigurationPage';
import AdminPropertyStorageReportsConfigurationPage from '@/pages/AdminPropertyStorageReportsConfigurationPage';
import AdminPropertyFunctionsReportsConfigurationPage from '@/pages/AdminPropertyFunctionsReportsConfigurationPage';
import AdminPropertyAuthReportsConfigurationPage from '@/pages/AdminPropertyAuthReportsConfigurationPage';
import AdminPropertyRealtimeReportsConfigurationPage from '@/pages/AdminPropertyRealtimeReportsConfigurationPage';
import AdminPropertyEdgeFunctionsReportsConfigurationPage from '@/pages/AdminPropertyEdgeFunctionsReportsConfigurationPage';
import AdminPropertySecretsReportsConfigurationPage from '@/pages/AdminPropertySecretsReportsConfigurationPage';
import AdminPropertyBillingReportsConfigurationPage from '@/pages/AdminPropertyBillingReportsConfigurationPage';
import AdminPropertyUsageReportsConfigurationPage from '@/pages/AdminPropertyUsageReportsConfigurationPage';
import AdminPropertySettingsReportsConfigurationPage from '@/pages/AdminPropertySettingsReportsConfigurationPage';
import AdminPropertyAccountReportsConfigurationPage from '@/pages/AdminPropertyAccountReportsConfigurationPage';
import AdminPropertyProfileReportsConfigurationPage from '@/pages/AdminPropertyProfileReportsConfigurationPage';
import AdminPropertySecurityReportsConfigurationPage from '@/pages/AdminPropertySecurityReportsConfigurationPage';
import AdminPropertyNotificationsAnalyticsConfigurationPage from '@/pages/AdminPropertyNotificationsAnalyticsConfigurationPage';
import AdminPropertyEmailAnalyticsConfigurationPage from '@/pages/AdminPropertyEmailAnalyticsConfigurationPage';
import AdminPropertySmsAnalyticsConfigurationPage from '@/pages/AdminPropertySmsAnalyticsConfigurationPage';
import AdminPropertyPushAnalyticsConfigurationPage from '@/pages/AdminPropertyPushAnalyticsConfigurationPage';
import AdminPropertyIntegrationsAnalyticsConfigurationPage from '@/pages/AdminPropertyIntegrationsAnalyticsConfigurationPage';
import AdminPropertyApiKeysAnalyticsConfigurationPage from '@/pages/AdminPropertyApiKeysAnalyticsConfigurationPage';
import AdminPropertyWebhooksAnalyticsConfigurationPage from '@/pages/AdminPropertyWebhooksAnalyticsConfigurationPage';
import AdminPropertyLogsAnalyticsConfigurationPage from '@/pages/AdminPropertyLogsAnalyticsConfigurationPage';
import AdminPropertyErrorsAnalyticsConfigurationPage from '@/pages/AdminPropertyErrorsAnalyticsConfigurationPage';
import AdminPropertyHealthAnalyticsConfigurationPage from '@/pages/AdminPropertyHealthAnalyticsConfigurationPage';
import AdminPropertyStatusAnalyticsConfigurationPage from '@/pages/AdminPropertyStatusAnalyticsConfigurationPage';
import AdminPropertyMaintenanceAnalyticsConfigurationPage from '@/pages/AdminPropertyMaintenanceAnalyticsConfigurationPage';
import AdminPropertyBackupAnalyticsConfigurationPage from '@/pages/AdminPropertyBackupAnalyticsConfigurationPage';
import AdminPropertyRestoreAnalyticsConfigurationPage from '@/pages/AdminPropertyRestoreAnalyticsConfigurationPage';
import AdminPropertyDeploymentsAnalyticsConfigurationPage from '@/pages/AdminPropertyDeploymentsAnalyticsConfigurationPage';
import AdminPropertyRollbacksAnalyticsConfigurationPage from '@/pages/AdminPropertyRollbacksAnalyticsConfigurationPage';
import AdminPropertyVersionsAnalyticsConfigurationPage from '@/pages/AdminPropertyVersionsAnalyticsConfigurationPage';
import AdminPropertyUpdatesAnalyticsConfigurationPage from '@/pages/AdminPropertyUpdatesAnalyticsConfigurationPage';
import AdminPropertyMigrationsAnalyticsConfigurationPage from '@/pages/AdminPropertyMigrationsAnalyticsConfigurationPage';
import AdminPropertySchemaAnalyticsConfigurationPage from '@/pages/AdminPropertySchemaAnalyticsConfigurationPage';
import AdminPropertyDatabaseAnalyticsConfigurationPage from '@/pages/AdminPropertyDatabaseAnalyticsConfigurationPage';
import AdminPropertyStorageAnalyticsConfigurationPage from '@/pages/AdminPropertyStorageAnalyticsConfigurationPage';
import AdminPropertyFunctionsAnalyticsConfigurationPage from '@/pages/AdminPropertyFunctionsAnalyticsConfigurationPage';
import AdminPropertyAuthAnalyticsConfigurationPage from '@/pages/AdminPropertyAuthAnalyticsConfigurationPage';
import AdminPropertyRealtimeAnalyticsConfigurationPage from '@/pages/AdminPropertyRealtimeAnalyticsConfigurationPage';
import AdminPropertyEdgeFunctionsAnalyticsConfigurationPage from '@/pages/AdminPropertyEdgeFunctionsAnalyticsConfigurationPage';
import AdminPropertySecretsAnalyticsConfigurationPage from '@/pages/AdminPropertySecretsAnalyticsConfigurationPage';
import AdminPropertyBillingAnalyticsConfigurationPage from '@/pages/AdminPropertyBillingAnalyticsConfigurationPage';
import AdminPropertyUsageAnalyticsConfigurationPage from '@/pages/AdminPropertyUsageAnalyticsConfigurationPage';
import AdminPropertySettingsAnalyticsConfigurationPage from '@/pages/AdminPropertySettingsAnalyticsConfigurationPage';
import AdminPropertyAccountAnalyticsConfigurationPage from '@/pages/AdminPropertyAccountAnalyticsConfigurationPage';
import AdminPropertyProfileAnalyticsConfigurationPage from '@/pages/AdminPropertyProfileAnalyticsConfigurationPage';
import AdminPropertySecurityAnalyticsConfigurationPage from '@/pages/AdminPropertySecurityAnalyticsConfigurationPage';
import AdminPropertyNotificationsDashboardConfigurationPage from '@/pages/AdminPropertyNotificationsDashboardConfigurationPage';
import AdminPropertyEmailDashboardConfigurationPage from '@/pages/AdminPropertyEmailDashboardConfigurationPage';
import AdminPropertySmsDashboardConfigurationPage from '@/pages/AdminPropertySmsDashboardConfigurationPage';
import AdminPropertyPushDashboardConfigurationPage from '@/pages/AdminPropertyPushDashboardConfigurationPage';
import AdminPropertyIntegrationsDashboardConfigurationPage from '@/pages/AdminPropertyIntegrationsDashboardConfigurationPage';
import AdminPropertyApiKeysDashboardConfigurationPage from '@/pages/AdminPropertyApiKeysDashboardConfigurationPage';
import AdminPropertyWebhooksDashboardConfigurationPage from '@/pages/AdminPropertyWebhooksDashboardConfigurationPage';
import AdminPropertyLogsDashboardConfigurationPage from '@/pages/AdminPropertyLogsDashboardConfigurationPage';
import AdminPropertyErrorsDashboardConfigurationPage from '@/pages/AdminPropertyErrorsDashboardConfigurationPage';
import AdminPropertyHealthDashboardConfigurationPage from '@/pages/AdminPropertyHealthDashboardConfigurationPage';
import AdminPropertyStatusDashboardConfigurationPage from '@/pages/AdminPropertyStatusDashboardConfigurationPage';
import AdminPropertyMaintenanceDashboardConfigurationPage from '@/pages/AdminPropertyMaintenanceDashboardConfigurationPage';
import AdminPropertyBackupDashboardConfigurationPage from '@/pages/AdminPropertyBackupDashboardConfigurationPage';
import AdminPropertyRestoreDashboardConfigurationPage from '@/pages/AdminPropertyRestoreDashboardConfigurationPage';
import AdminPropertyDeploymentsDashboardConfigurationPage from '@/pages/AdminPropertyDeploymentsDashboardConfigurationPage';
import AdminPropertyRollbacksDashboardConfigurationPage from '@/pages/AdminPropertyRollbacksDashboardConfigurationPage';
import AdminPropertyVersionsDashboardConfigurationPage from '@/pages/AdminPropertyVersionsDashboardConfigurationPage';
import AdminPropertyUpdatesDashboardConfigurationPage from '@/pages/AdminPropertyUpdatesDashboardConfigurationPage';
import AdminPropertyMigrationsDashboardConfigurationPage from '@/pages/AdminPropertyMigrationsDashboardConfigurationPage';
import AdminPropertySchemaDashboardConfigurationPage from '@/pages/AdminPropertySchemaDashboardConfigurationPage';
import AdminPropertyDatabaseDashboardConfigurationPage from '@/pages/AdminPropertyDatabaseDashboardConfigurationPage';
import AdminPropertyStorageDashboardConfigurationPage from '@/pages/AdminPropertyStorageDashboardConfigurationPage';
import AdminPropertyFunctionsDashboardConfigurationPage from '@/pages/AdminPropertyFunctionsDashboardConfigurationPage';
import AdminPropertyAuthDashboardConfigurationPage from '@/pages/AdminPropertyAuthDashboardConfigurationPage';
import AdminPropertyRealtimeDashboardConfigurationPage from '@/pages/AdminPropertyRealtimeDashboardConfigurationPage';
import AdminPropertyEdgeFunctionsDashboardConfigurationPage from '@/pages/AdminPropertyEdgeFunctionsDashboardConfigurationPage';
import AdminPropertySecretsDashboardConfigurationPage from '@/pages/AdminPropertySecretsDashboardConfigurationPage';
import AdminPropertyBillingDashboardConfigurationPage from '@/pages/AdminPropertyBillingDashboardConfigurationPage';
import AdminPropertyUsageDashboardConfigurationPage from '@/pages/AdminPropertyUsageDashboardConfigurationPage';
import AdminPropertySettingsDashboardConfigurationPage from '@/pages/AdminPropertySettingsDashboardConfigurationPage';
import AdminPropertyAccountDashboardConfigurationPage from '@/pages/AdminPropertyAccountDashboardConfigurationPage';
import AdminPropertyProfileDashboardConfigurationPage from '@/pages/AdminPropertyProfileDashboardConfigurationPage';
import AdminPropertySecurityDashboardConfigurationPage from '@/pages/AdminPropertySecurityDashboardConfigurationPage';
import AdminPropertyNotificationsOverviewConfigurationPage from '@/pages/AdminPropertyNotificationsOverviewConfigurationPage';
import AdminPropertyEmailOverviewConfigurationPage from '@/pages/AdminPropertyEmailOverviewConfigurationPage';
import AdminPropertySmsOverviewConfigurationPage from '@/pages/AdminPropertySmsOverviewConfigurationPage';
import AdminPropertyPushOverviewConfigurationPage from '@/pages/AdminPropertyPushOverviewConfigurationPage';
import AdminPropertyIntegrationsOverviewConfigurationPage from '@/pages/AdminPropertyIntegrationsOverviewConfigurationPage';
import AdminPropertyApiKeysOverviewConfigurationPage from '@/pages/AdminPropertyApiKeysOverviewConfigurationPage';
import AdminPropertyWebhooksOverviewConfigurationPage from '@/pages/AdminPropertyWebhooksOverviewConfigurationPage';
import AdminPropertyLogsOverviewConfigurationPage from '@/pages/AdminPropertyLogsOverviewConfigurationPage';
import AdminPropertyErrorsOverviewConfigurationPage from '@/pages/AdminPropertyErrorsOverviewConfigurationPage';
import AdminPropertyHealthOverviewConfigurationPage from '@/pages/AdminPropertyHealthOverviewConfigurationPage';
import AdminPropertyStatusOverviewConfigurationPage from '@/pages/AdminPropertyStatusOverviewConfigurationPage';
import AdminPropertyMaintenanceOverviewConfigurationPage from '@/pages/AdminPropertyMaintenanceOverviewConfigurationPage';
import AdminPropertyBackupOverviewConfigurationPage from '@/pages/AdminPropertyBackupOverviewConfigurationPage';
import AdminPropertyRestoreOverviewConfigurationPage from '@/pages/AdminPropertyRestoreOverviewConfigurationPage';
import AdminPropertyDeploymentsOverviewConfigurationPage from '@/pages/AdminPropertyDeploymentsOverviewConfigurationPage';
import AdminPropertyRollbacksOverviewConfigurationPage from '@/pages/AdminPropertyRollbacksOverviewConfigurationPage';
import AdminPropertyVersionsOverviewConfigurationPage from '@/pages/AdminPropertyVersionsOverviewConfigurationPage';
import AdminPropertyUpdatesOverviewConfigurationPage from '@/pages/AdminPropertyUpdatesOverviewConfigurationPage';
import AdminPropertyMigrationsOverviewConfigurationPage from '@/pages/AdminPropertyMigrationsOverviewConfigurationPage';
import AdminPropertySchemaOverviewConfigurationPage from '@/pages/AdminPropertySchemaOverviewConfigurationPage';
import AdminPropertyDatabaseOverviewConfigurationPage from '@/pages/AdminPropertyDatabaseOverviewConfigurationPage';
import AdminPropertyStorageOverviewConfigurationPage from '@/pages/AdminPropertyStorageOverviewConfigurationPage';
import AdminPropertyFunctionsOverviewConfigurationPage from '@/pages/AdminPropertyFunctionsOverviewConfigurationPage';
import AdminPropertyAuthOverviewConfigurationPage from '@/pages/AdminPropertyAuthOverviewConfigurationPage';
import AdminPropertyRealtimeOverviewConfigurationPage from '@/pages/AdminPropertyRealtimeOverviewConfigurationPage';
import AdminPropertyEdgeFunctionsOverviewConfigurationPage from '@/pages/AdminPropertyEdgeFunctionsOverviewConfigurationPage';
import AdminPropertySecretsOverviewConfigurationPage from '@/pages/AdminPropertySecretsOverviewConfigurationPage';
import AdminPropertyBillingOverviewConfigurationPage from '@/pages/AdminPropertyBillingOverviewConfigurationPage';
import AdminPropertyUsageOverviewConfigurationPage from '@/pages/AdminPropertyUsageOverviewConfigurationPage';
import AdminPropertySettingsOverviewConfigurationPage from '@/pages/AdminPropertySettingsOverviewConfigurationPage';
import AdminPropertyAccountOverviewConfigurationPage from '@/pages/AdminPropertyAccountOverviewConfigurationPage';
import AdminPropertyProfileOverviewConfigurationPage from '@/pages/AdminPropertyProfileOverviewConfigurationPage';
import AdminPropertySecurityOverviewConfigurationPage from '@/pages/AdminPropertySecurityOverviewConfigurationPage';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/crm" element={<CRM />} />
                  <Route path="/admin/saved-properties" element={<AdminSavedPropertiesListingPage />} />
                  <Route path="/admin/featured-properties" element={<AdminFeaturedPropertiesListingPage />} />
                  <Route path="/admin/market-intelligence" element={<AdminMarketIntelligenceListingPage />} />
                  <Route path="/admin/property-verification" element={<AdminPropertyVerificationPage />} />
                  <Route path="/admin/research-reports" element={<AdminResearchReportsListingPage />} />
                  <Route path="/admin/settings" element={<AdminSiteSettingsPage />} />
                  <Route path="/admin/translations" element={<AdminTranslationsPage />} />
                  <Route path="/admin/market-data" element={<AdminMarketDataPage />} />
                  <Route path="/admin/market-insights" element={<AdminMarketInsightsPage />} />
                  <Route path="/admin/leads" element={<AdminLeadsPage />} />
                  <Route path="/admin/activities" element={<AdminActivitiesPage />} />
                  <Route path="/admin/credentials" element={<AdminCredentialsPage />} />
                  <Route path="/admin/property-form" element={<AdminPropertyFormPage />} />
                  <Route path="/admin/property-details/:id" element={<AdminPropertyDetailsPage />} />
                  <Route path="/admin/property-edit/:id" element={<AdminPropertyEditPage />} />
                  <Route path="/admin/property-create" element={<AdminPropertyCreatePage />} />
                  <Route path="/admin/property-listing" element={<AdminPropertyListingPage />} />
                  <Route path="/admin/property-feature-requests" element={<AdminPropertyFeatureRequestsPage />} />
                  <Route path="/admin/property-inquiries" element={<AdminPropertyInquiriesPage />} />
                  <Route path="/admin/user-inquiries" element={<AdminUserInquiriesPage />} />
                  <Route path="/admin/search-history" element={<AdminSearchHistoryPage />} />
                  <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                  <Route path="/admin/lead-notes" element={<AdminLeadNotesPage />} />
                  <Route path="/admin/phone-otps" element={<AdminPhoneOTPsPage />} />
                  <Route path="/admin/user-roles" element={<AdminUserRolesPage />} />
                  <Route path="/admin/user-secondary-contacts" element={<AdminUserSecondaryContactsPage />} />
                  <Route path="/admin/property-analytics" element={<AdminPropertyAnalyticsPage />} />
                  <Route path="/admin/property-reports" element={<AdminPropertyReportsPage />} />
                  <Route path="/admin/property-comparisons" element={<AdminPropertyComparisonsPage />} />
                  <Route path="/admin/property-trends" element={<AdminPropertyTrendsPage />} />
                  <Route path="/admin/property-heatmap" element={<AdminPropertyHeatmapPage />} />
                  <Route path="/admin/property-forecast" element={<AdminPropertyForecastPage />} />
                  <Route path="/admin/property-recommendations" element={<AdminPropertyRecommendationsPage />} />
                  <Route path="/admin/property-alerts" element={<AdminPropertyAlertsPage />} />
                  <Route path="/admin/property-notifications" element={<AdminPropertyNotificationsPage />} />
                  <Route path="/admin/property-messages" element={<AdminPropertyMessagesPage />} />
                  <Route path="/admin/property-reviews" element={<AdminPropertyReviewsPage />} />
                  <Route path="/admin/property-ratings" element={<AdminPropertyRatingsPage />} />
                  <Route path="/admin/property-feedback" element={<AdminPropertyFeedbackPage />} />
                  <Route path="/admin/property-support" element={<AdminPropertySupportPage />} />
                  <Route path="/admin/property-help" element={<AdminPropertyHelpPage />} />
                  <Route path="/admin/property-documentation" element={<AdminPropertyDocumentationPage />} />
                  <Route path="/admin/property-api" element={<AdminPropertyApiPage />} />
                  <Route path="/admin/property-integrations" element={<AdminPropertyIntegrationsPage />} />
                  <Route path="/admin/property-webhooks" element={<AdminPropertyWebhooksPage />} />
                  <Route path="/admin/property-logs" element={<AdminPropertyLogsPage />} />
                  <Route path="/admin/property-errors" element={<AdminPropertyErrorsPage />} />
                  <Route path="/admin/property-health" element={<AdminPropertyHealthPage />} />
                  <Route path="/admin/property-status" element={<AdminPropertyStatusPage />} />
                  <Route path="/admin/property-maintenance" element={<AdminPropertyMaintenancePage />} />
                  <Route path="/admin/property-backup" element={<AdminPropertyBackupPage />} />
                  <Route path="/admin/property-restore" element={<AdminPropertyRestorePage />} />
                  <Route path="/admin/property-deployments" element={<AdminPropertyDeploymentsPage />} />
                  <Route path="/admin/property-rollbacks" element={<AdminPropertyRollbacksPage />} />
                  <Route path="/admin/property-versions" element={<AdminPropertyVersionsPage />} />
                  <Route path="/admin/property-updates" element={<AdminPropertyUpdatesPage />} />
                  <Route path="/admin/property-migrations" element={<AdminPropertyMigrationsPage />} />
                  <Route path="/admin/property-schema" element={<AdminPropertySchemaPage />} />
                  <Route path="/admin/property-database" element={<AdminPropertyDatabasePage />} />
                  <Route path="/admin/property-storage" element={<AdminPropertyStoragePage />} />
                  <Route path="/admin/property-functions" element={<AdminPropertyFunctionsPage />} />
                  <Route path="/admin/property-auth" element={<AdminPropertyAuthPage />} />
                  <Route path="/admin/property-realtime" element={<AdminPropertyRealtimePage />} />
                  <Route path="/admin/property-edge-functions" element={<AdminPropertyEdgeFunctionsPage />} />
                  <Route path="/admin/property-secrets" element={<AdminPropertySecretsPage />} />
                  <Route path="/admin/property-billing" element={<AdminPropertyBillingPage />} />
                  <Route path="/admin/property-usage" element={<AdminPropertyUsagePage />} />
                  <Route path="/admin/property-settings" element={<AdminPropertySettingsPage />} />
                  <Route path="/admin/property-account" element={<AdminPropertyAccountPage />} />
                  <Route path="/admin/property-profile" element={<AdminPropertyProfilePage />} />
                  <Route path="/admin/property-security" element={<AdminPropertySecurityPage />} />
                  <Route path="/admin/property-notifications-settings" element={<AdminPropertyNotificationsSettingsPage />} />
                  <Route path="/admin/property-email-settings" element={<AdminPropertyEmailSettingsPage />} />
                  <Route path="/admin/property-sms-settings" element={<AdminPropertySmsSettingsPage />} />
                  <Route path="/admin/property-push-settings" element={<AdminPropertyPushSettingsPage />} />
                  <Route path="/admin/property-integrations-settings" element={<AdminPropertyIntegrationsSettingsPage />} />
                  <Route path="/admin/property-api-keys-settings" element={<AdminPropertyApiKeysSettingsPage />} />
                  <Route path="/admin/property-webhooks-settings" element={<AdminPropertyWebhooksSettingsPage />} />
                  <Route path="/admin/property-logs-settings" element={<AdminPropertyLogsSettingsPage />} />
                  <Route path="/admin/property-errors-settings" element={<AdminPropertyErrorsSettingsPage />} />
                  <Route path="/admin/property-health-settings" element={<AdminPropertyHealthSettingsPage />} />
                  <Route path="/admin/property-status-settings" element={<AdminPropertyStatusSettingsPage />} />
                  <Route path="/admin/property-maintenance-settings" element={<AdminPropertyMaintenanceSettingsPage />} />
                  <Route path="/admin/property-backup-settings" element={<AdminPropertyBackupSettingsPage />} />
                  <Route path="/admin/property-restore-settings" element={<AdminPropertyRestoreSettingsPage />} />
                  <Route path="/admin/property-deployments-settings" element={<AdminPropertyDeploymentsSettingsPage />} />
                  <Route path="/admin/property-rollbacks-settings" element={<AdminPropertyRollbacksSettingsPage />} />
                  <Route path="/admin/property-versions-settings" element={<AdminPropertyVersionsSettingsPage />} />
                  <Route path="/admin/property-updates-settings" element={<AdminPropertyUpdatesSettingsPage />} />
                  <Route path="/admin/property-migrations-settings" element={<AdminPropertyMigrationsSettingsPage />} />
                  <Route path="/admin/property-schema-settings" element={<AdminPropertySchemaSettingsPage />} />
                  <Route path="/admin/property-database-settings" element={<AdminPropertyDatabaseSettingsPage />} />
                  <Route path="/admin/property-storage-settings" element={<AdminPropertyStorageSettingsPage />} />
                  <Route path="/admin/property-functions-settings" element={<AdminPropertyFunctionsSettingsPage />} />
                  <Route path="/admin/property-auth-settings" element={<AdminPropertyAuthSettingsPage />} />
                  <Route path="/admin/property-realtime-settings" element={<AdminPropertyRealtimeSettingsPage />} />
                  <Route path="/admin/property-edge-functions-settings" element={<AdminPropertyEdgeFunctionsSettingsPage />} />
                  <Route path="/admin/property-secrets-settings" element={<AdminPropertySecretsSettingsPage />} />
                  <Route path="/admin/property-billing-settings" element={<AdminPropertyBillingSettingsPage />} />
                  <Route path="/admin/property-usage-settings" element={<AdminPropertyUsageSettingsPage />} />
                  <Route path="/admin/property-settings-settings" element={<AdminPropertySettingsSettingsPage />} />
                  <Route path="/admin/property-account-settings" element={<AdminPropertyAccountSettingsPage />} />
                  <Route path="/admin/property-profile-settings" element={<AdminPropertyProfileSettingsPage />} />
                  <Route path="/admin/property-security-settings" element={<AdminPropertySecuritySettingsPage />} />
                  <Route path="/admin/property-notifications-management" element={<AdminPropertyNotificationsManagementPage />} />
                  <Route path="/admin/property-email-management" element={<AdminPropertyEmailManagementPage />} />
                  <Route path="/admin/property-sms-management" element={<AdminPropertySmsManagementPage />} />
                  <Route path="/admin/property-push-management" element={<AdminPropertyPushManagementPage />} />
                  <Route path="/admin/property-integrations-management" element={<AdminPropertyIntegrationsManagementPage />} />
                  <Route path="/admin/property-api-keys-management" element={<AdminPropertyApiKeysManagementPage />} />
                  <Route path="/admin/property-webhooks-management" element={<AdminPropertyWebhooksManagementPage />} />
                  <Route path="/admin/property-logs-management" element={<AdminPropertyLogsManagementPage />} />
                  <Route path="/admin/property-errors-management" element={<AdminPropertyErrorsManagementPage />} />
                  <Route path="/admin/property-health-management" element={<AdminPropertyHealthManagementPage />} />
                  <Route path="/admin/property-status-management" element={<AdminPropertyStatusManagementPage />} />
                  <Route path="/admin/property-maintenance-management" element={<AdminPropertyMaintenanceManagementPage />} />
                  <Route path="/admin/property-backup-management" element={<AdminPropertyBackupManagementPage />} />
                  <Route path="/admin/property-restore-management" element={<AdminPropertyRestoreManagementPage />} />
                  <Route path="/admin/property-deployments-management" element={<AdminPropertyDeploymentsManagementPage />} />
                  <Route path="/admin/property-rollbacks-management" element={<AdminPropertyRollbacksManagementPage />} />
                  <Route path="/admin/property-versions-management" element={<AdminPropertyVersionsManagementPage />} />
                  <Route path="/admin/property-updates-management" element={<AdminPropertyUpdatesManagementPage />} />
                  <Route path="/admin/property-migrations-management" element={<AdminPropertyMigrationsManagementPage />} />
                  <Route path="/admin/property-schema-management" element={<AdminPropertySchemaManagementPage />} />
                  <Route path="/admin/property-database-management" element={<AdminPropertyDatabaseManagementPage />} />
                  <Route path="/admin/property-storage-management" element={<AdminPropertyStorageManagementPage />} />
                  <Route path="/admin/property-functions-management" element={<AdminPropertyFunctionsManagementPage />} />
                  <Route path="/admin/property-auth-management" element={<AdminPropertyAuthManagementPage />} />
                  <Route path="/admin/property-realtime-management" element={<AdminPropertyRealtimeManagementPage />} />
                  <Route path="/admin/property-edge-functions-management" element={<AdminPropertyEdgeFunctionsManagementPage />} />
                  <Route path="/admin/property-secrets-management" element={<AdminPropertySecretsManagementPage />} />
                  <Route path="/admin/property-billing-management" element={<AdminPropertyBillingManagementPage />} />
                  <Route path="/admin/property-usage-management" element={<AdminPropertyUsageManagementPage />} />
                  <Route path="/admin/property-settings-management" element={<AdminPropertySettingsManagementPage />} />
                  <Route path="/admin/property-account-management" element={<AdminPropertyAccountManagementPage />} />
                  <Route path="/admin/property-profile-management" element={<AdminPropertyProfileManagementPage />} />
                  <Route path="/admin/property-security-management" element={<AdminPropertySecurityManagementPage />} />
                  <Route path="/admin/property-notifications-history" element={<AdminPropertyNotificationsHistoryPage />} />
                  <Route path="/admin/property-email-history" element={<AdminPropertyEmailHistoryPage />} />
                  <Route path="/admin/property-sms-history" element={<AdminPropertySmsHistoryPage />} />
                  <Route path="/admin/property-push-history" element={<AdminPropertyPushHistoryPage />} />
                  <Route path="/admin/property-integrations-history" element={<AdminPropertyIntegrationsHistoryPage />} />
                  <Route path="/admin/property-api-keys-history" element={<AdminPropertyApiKeysHistoryPage />} />
                  <Route path="/admin/property-webhooks-history" element={<AdminPropertyWebhooksHistoryPage />} />
                  <Route path="/admin/property-logs-history" element={<AdminPropertyLogsHistoryPage />} />
                  <Route path="/admin/property-errors-history" element={<AdminPropertyErrorsHistoryPage />} />
                  <Route path="/admin/property-health-history" element={<AdminPropertyHealthHistoryPage />} />
                  <Route path="/admin/property-status-history" element={<AdminPropertyStatusHistoryPage />} />
                  <Route path="/admin/property-maintenance-history" element={<AdminPropertyMaintenanceHistoryPage />} />
                  <Route path="/admin/property-backup-history" element={<AdminPropertyBackupHistoryPage />} />
                  <Route path="/admin/property-restore-history" element={<AdminPropertyRestoreHistoryPage />} />
                  <Route path="/admin/property-deployments-history" element={<AdminPropertyDeploymentsHistoryPage />} />
                  <Route path="/admin/property-rollbacks-history" element={<AdminPropertyRollbacksHistoryPage />} />
                  <Route path="/admin/property-versions-history" element={<AdminPropertyVersionsHistoryPage />} />
                  <Route path="/admin/property-updates-history" element={<AdminPropertyUpdatesHistoryPage />} />
                  <Route path="/admin/property-migrations-history" element={<AdminPropertyMigrationsHistoryPage />} />
                  <Route path="/admin/property-schema-history" element={<AdminPropertySchemaHistoryPage />} />
                  <Route path="/admin/property-database-history" element={<AdminPropertyDatabaseHistoryPage />} />
                  <Route path="/admin/property-storage-history" element={<AdminPropertyStorageHistoryPage />} />
                  <Route path="/admin/property-functions-history" element={<AdminPropertyFunctionsHistoryPage />} />
                  <Route path="/admin/property-auth-history" element={<AdminPropertyAuthHistoryPage />} />
                  <Route path="/admin/property-realtime-history" element={<AdminPropertyRealtimeHistoryPage />} />
                  <Route path="/admin/property-edge-functions-history" element={<AdminPropertyEdgeFunctionsHistoryPage />} />
                  <Route path="/admin/property-secrets-history" element={<AdminPropertySecretsHistoryPage />} />
                  <Route path="/admin/property-billing-history" element={<AdminPropertyBillingHistoryPage />} />
                  <Route path="/admin/property-usage-history" element={<AdminPropertyUsageHistoryPage />} />
                  <Route path="/admin/property-settings-history" element={<AdminPropertySettingsHistoryPage />} />
                  <Route path="/admin/property-account-history" element={<AdminPropertyAccountHistoryPage />} />
                  <Route path="/admin/property-profile-history" element={<AdminPropertyProfileHistoryPage />} />
                  <Route path="/admin/property-security-history" element={<AdminPropertySecurityHistoryPage />} />
                  <Route path="/admin/property-notifications-reports" element={<AdminPropertyNotificationsReportsPage />} />
                  <Route path="/admin/property-email-reports" element={<AdminPropertyEmailReportsPage />} />
                  <Route path="/admin/property-sms-reports" element={<AdminPropertySmsReportsPage />} />
                  <Route path="/admin/property-push-reports" element={<AdminPropertyPushReportsPage />} />
                  <Route path="/admin/property-integrations-reports" element={<AdminPropertyIntegrationsReportsPage />} />
                  <Route path="/admin/property-api-keys-reports" element={<AdminPropertyApiKeysReportsPage />} />
                  <Route path="/admin/property-webhooks-reports" element={<AdminPropertyWebhooksReportsPage />} />
                  <Route path="/admin/property-logs-reports" element={<AdminPropertyLogsReportsPage />} />
                  <Route path="/admin/property-errors-reports" element={<AdminPropertyErrorsReportsPage />} />
                  <Route path="/admin/property-health-reports" element={<AdminPropertyHealthReportsPage />} />
                  <Route path="/admin/property-status-reports" element={<AdminPropertyStatusReportsPage />} />
                  <Route path="/admin/property-maintenance-reports" element={<AdminPropertyMaintenanceReportsPage />} />
                  <Route path="/admin/property-backup-reports" element={<AdminPropertyBackupReportsPage />} />
                  <Route path="/admin/property-restore-reports" element={<AdminPropertyRestoreReportsPage />} />
                  <Route path="/admin/property-deployments-reports" element={<AdminPropertyDeploymentsReportsPage />} />
                  <Route path="/admin/property-rollbacks-reports" element={<AdminPropertyRollbacksReportsPage />} />
                  <Route path="/admin/property-versions-reports" element={<AdminPropertyVersionsReportsPage />} />
                  <Route path="/admin/property-updates-reports" element={<AdminPropertyUpdatesReportsPage />} />
                  <Route path="/admin/property-migrations-reports" element={<AdminPropertyMigrationsReportsPage />} />
                  <Route path="/admin/property-schema-reports" element={<AdminPropertySchemaReportsPage />} />
                  <Route path="/admin/property-database-reports" element={<AdminPropertyDatabaseReportsPage />} />
                  <Route path="/admin/property-storage-reports" element={<AdminPropertyStorageReportsPage />} />
                  <Route path="/admin/property-functions-reports" element={<AdminPropertyFunctionsReportsPage />} />
                  <Route path="/admin/property-auth-reports" element={<AdminPropertyAuthReportsPage />} />
                  <Route path="/admin/property-realtime-reports" element={<AdminPropertyRealtimeReportsPage />} />
                  <Route path="/admin/property-edge-functions-reports" element={<AdminPropertyEdgeFunctionsReportsPage />} />
                  <Route path="/admin/property-secrets-reports" element={<AdminPropertySecretsReportsPage />} />
                  <Route path="/admin/property-billing-reports" element={<AdminPropertyBillingReportsPage />} />
                  <Route path="/admin/property-usage-reports" element={<AdminPropertyUsageReportsPage />} />
                  <Route path="/admin/property-settings-reports" element={<AdminPropertySettingsReportsPage />} />
                  <Route path="/admin/property-account-reports" element={<AdminPropertyAccountReportsPage />} />
                  <Route path="/admin/property-profile-reports" element={<AdminPropertyProfileReportsPage />} />
                  <Route path="/admin/property-security-reports" element={<AdminPropertySecurityReportsPage />} />
                  <Route path="/admin/property-notifications-analytics" element={<AdminPropertyNotificationsAnalyticsPage />} />
                  <Route path="/admin/property-email-analytics" element={<AdminPropertyEmailAnalyticsPage />} />
                  <Route path="/admin/property-sms-analytics" element={<AdminPropertySmsAnalyticsPage />} />
                  <Route path="/admin/property-push-analytics" element={<AdminPropertyPushAnalyticsPage />} />
                  <Route path="/admin/property-integrations-analytics" element={<AdminPropertyIntegrationsAnalyticsPage />} />
                  <Route path="/admin/property-api-keys-analytics" element={<AdminPropertyApiKeysAnalyticsPage />} />
                  <Route path="/admin/property-webhooks-analytics" element={<AdminPropertyWebhooksAnalyticsPage />} />
                  <Route path="/admin/property-logs-analytics" element={<AdminPropertyLogsAnalyticsPage />} />
                  <Route path="/admin/property-errors-analytics" element={<AdminPropertyErrorsAnalyticsPage />} />
                  <Route path="/admin/property-health-analytics" element={<AdminPropertyHealthAnalyticsPage />} />
                  <Route path="/admin/property-status-analytics" element={<AdminPropertyStatusAnalyticsPage />} />
                  <Route path="/admin/property-maintenance-analytics" element={<AdminPropertyMaintenanceAnalyticsPage />} />
                  <Route path="/admin/property-backup-analytics" element={<AdminPropertyBackupAnalyticsPage />} />
                  <Route path="/admin/property-restore-analytics" element={<AdminPropertyRestoreAnalyticsPage />} />
                  <Route path="/admin/property-deployments-analytics" element={<AdminPropertyDeploymentsAnalyticsPage />} />
                  <Route path="/admin/property-rollbacks-analytics" element={<AdminPropertyRollbacksAnalyticsPage />} />
                  <Route path="/admin/property-versions-analytics" element={<AdminPropertyVersionsAnalyticsPage />} />
                  <Route path="/admin/property-updates-analytics" element={<AdminPropertyUpdatesAnalyticsPage />} />
                  <Route path="/admin/property-migrations-analytics" element={<AdminPropertyMigrationsAnalyticsPage />} />
                  <Route path="/admin/property-schema-analytics" element={<AdminPropertySchemaAnalyticsPage />} />
                  <Route path="/admin/property-database-analytics" element={<AdminPropertyDatabaseAnalyticsPage />} />
                  <Route path="/admin/property-storage-analytics" element={<AdminPropertyStorageAnalyticsPage />} />
                  <Route path="/admin/property-functions-analytics" element={<AdminPropertyFunctionsAnalyticsPage />} />
                  <Route path="/admin/property-auth-analytics" element={<AdminPropertyAuthAnalyticsPage />} />
                  <Route path="/admin/property-realtime-analytics" element={<AdminPropertyRealtimeAnalyticsPage />} />
                  <Route path="/admin/property-edge-functions-analytics" element={<AdminPropertyEdgeFunctionsAnalyticsPage />} />
                  <Route path="/admin/property-secrets-analytics" element={<AdminPropertySecretsAnalyticsPage />} />
                  <Route path="/admin/property-billing-analytics" element={<AdminPropertyBillingAnalyticsPage />} />
                  <Route path="/admin/property-usage-analytics" element={<AdminPropertyUsageAnalyticsPage />} />
                  <Route path="/admin/property-settings-analytics" element={<AdminPropertySettingsAnalyticsPage />} />
                  <Route path="/admin/property-account-analytics" element={<AdminPropertyAccountAnalyticsPage />} />
                  <Route path="/admin/property-profile-analytics" element={<AdminPropertyProfileAnalyticsPage />} />
                  <Route path="/admin/property-security-analytics" element={<AdminPropertySecurityAnalyticsPage />} />
                  <Route path="/admin/property-notifications-dashboard" element={<AdminPropertyNotificationsDashboardPage />} />
                  <Route path="/admin/property-email-dashboard" element={<AdminPropertyEmailDashboardPage />} />
                  <Route path="/admin/property-sms-dashboard" element={<AdminPropertySmsDashboardPage />} />
                  <Route path="/admin/property-push-dashboard" element={<AdminPropertyPushDashboardPage />} />
                  <Route path="/admin/property-integrations-dashboard" element={<AdminPropertyIntegrationsDashboardPage />} />
                  <Route path="/admin/property-api-keys-dashboard" element={<AdminPropertyApiKeysDashboardPage />} />
                  <Route path="/admin/property-webhooks-dashboard" element={<AdminPropertyWebhooksDashboardPage />} />
                  <Route path="/admin/property-logs-dashboard" element={<AdminPropertyLogsDashboardPage />} />
                  <Route path="/admin/property-errors-dashboard" element={<AdminPropertyErrorsDashboardPage />} />
                  <Route path="/admin/property-health-dashboard" element={<AdminPropertyHealthDashboardPage />} />
                  <Route path="/admin/property-status-dashboard" element={<AdminPropertyStatusDashboardPage />} />
                  <Route path="/admin/property-maintenance-dashboard" element={<AdminPropertyMaintenanceDashboardPage />} />
                  <Route path="/admin/property-backup-dashboard" element={<AdminPropertyBackupDashboardPage />} />
                  <Route path="/admin/property-restore-dashboard" element={<AdminPropertyRestoreDashboardPage />} />
                  <Route path="/admin/property-deployments-dashboard" element={<AdminPropertyDeploymentsDashboardPage />} />
                  <Route path="/admin/property-rollbacks-dashboard" element={<AdminPropertyRollbacksDashboardPage />} />
                  <Route path="/admin/property-versions-dashboard" element={<AdminPropertyVersionsDashboardPage />} />
                  <Route path="/admin/property-updates-dashboard" element={<AdminPropertyUpdatesDashboardPage />} />
                  <Route path="/admin/property-migrations-dashboard" element={<AdminPropertyMigrationsDashboardPage />} />
                  <Route path="/admin/property-schema-dashboard" element={<AdminPropertySchemaDashboardPage />} />
                  <Route path="/admin/property-database-dashboard" element={<AdminPropertyDatabaseDashboardPage />} />
                  <Route path="/admin/property-storage-dashboard" element={<AdminPropertyStorageDashboardPage />} />
                  <Route path="/admin/property-functions-dashboard" element={<AdminPropertyFunctionsDashboardPage />} />
                  <Route path="/admin/property-auth-dashboard" element={<AdminPropertyAuthDashboardPage />} />
                  <Route path="/admin/property-realtime-dashboard" element={<AdminPropertyRealtimeDashboardPage />} />
                  <Route path="/admin/property-edge-functions-dashboard" element={<AdminPropertyEdgeFunctionsDashboardPage />} />
                  <Route path="/admin/property-secrets-dashboard" element={<AdminPropertySecretsDashboardPage />} />
                  <Route path="/admin/property-billing-dashboard" element={<AdminPropertyBillingDashboardPage />} />
                  <Route path="/admin/property-usage-dashboard" element={<AdminPropertyUsageDashboardPage />} />
                  <Route path="/admin/property-settings-dashboard" element={<AdminPropertySettingsDashboardPage />} />
                  <Route path="/admin/property-account-dashboard" element={<AdminPropertyAccountDashboardPage />} />
                  <Route path="/admin/property-profile-dashboard" element={<AdminPropertyProfileDashboardPage />} />
                  <Route path="/admin/property-security-dashboard" element={<AdminPropertySecurityDashboardPage />} />
                  <Route path="/admin/property-notifications-overview" element={<AdminPropertyNotificationsOverviewPage />} />
                  <Route path="/admin/property-email-overview" element={<AdminPropertyEmailOverviewPage />} />
                  <Route path="/admin/property-sms-overview" element={<AdminPropertySmsOverviewPage />} />
                  <Route path="/admin/property-push-overview" element={<AdminPropertyPushOverviewPage />} />
                  <Route path="/admin/property-integrations-overview" element={<AdminPropertyIntegrationsOverviewPage />} />
                  <Route path="/admin/property-api-keys-overview" element={<AdminPropertyApiKeysOverviewPage />} />
                  <Route path="/admin/property-webhooks-overview" element={<AdminPropertyWebhooksOverviewPage />} />
                  <Route path="/admin/property-logs-overview" element={<AdminPropertyLogsOverviewPage />} />
                  <Route path="/admin/property-errors-overview" element={<AdminPropertyErrorsOverviewPage />} />
                  <Route path="/admin/property-health-overview" element={<AdminPropertyHealthOverviewPage />} />
                  <Route path="/admin/property-status-overview" element={<AdminPropertyStatusOverviewPage />} />
                  <Route path="/admin/property-maintenance-overview" element={<AdminPropertyMaintenanceOverviewPage />} />
                  <Route path="/admin/property-backup-overview" element={<AdminPropertyBackupOverviewPage />} />
                  <Route path="/admin/property-restore-overview" element={<AdminPropertyRestoreOverviewPage />} />
                  <Route path="/admin/property-deployments-overview" element={<AdminPropertyDeploymentsOverviewPage />} />
                  <Route path="/admin/property-rollbacks-overview" element={<AdminPropertyRollbacksOverviewPage />} />
                  <Route path="/admin/property-versions-overview" element={<AdminPropertyVersionsOverviewPage />} />
                  <Route path="/admin/property-updates-overview" element={<AdminPropertyUpdatesOverviewPage />} />
                  <Route path="/admin/property-migrations-overview" element={<AdminPropertyMigrationsOverviewPage />} />
                  <Route path="/admin/property-schema-overview" element={<AdminPropertySchemaOverviewPage />} />
                  <Route path="/admin/property-database-overview" element={<AdminPropertyDatabaseOverviewPage />} />
                  <Route path="/admin/property-storage-overview" element={<AdminPropertyStorageOverviewPage />} />
                  <Route path="/admin/property-functions-overview" element={<AdminPropertyFunctionsOverviewPage />} />
                  <Route path="/admin/property-auth-overview" element={<AdminPropertyAuthOverviewPage />} />
                  <Route path="/admin/property-realtime-overview" element={<AdminPropertyRealtimeOverviewPage />} />
                  <Route path="/admin/property-edge-functions-overview" element={<AdminPropertyEdgeFunctionsOverviewPage />} />
                  <Route path="/admin/property-secrets-overview" element={<AdminPropertySecretsOverviewPage />} />
                  <Route path="/admin/property-billing-overview" element={<AdminPropertyBillingOverviewPage />} />
                  <Route path="/admin/property-usage-overview" element={<AdminPropertyUsageOverviewPage />} />
                  <Route path="/admin/property-settings-overview" element={<AdminPropertySettingsOverviewPage />} />
                  <Route path="/admin/property-account-overview" element={<AdminPropertyAccountOverviewPage />} />
                  <Route path="/admin/property-profile-overview" element={<AdminPropertyProfileOverviewPage />} />
                  <Route path="/admin/property-security-overview" element={<AdminPropertySecurityOverviewPage />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;