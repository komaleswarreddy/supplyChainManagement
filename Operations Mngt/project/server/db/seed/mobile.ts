import { db } from '../index';
import { mobileDevices, mobileSessions, mobileNotifications, mobileConfigurations, mobileAnalytics, mobileAppVersions, mobilePermissions, mobileSyncData } from '../schema/mobile';

export async function seedMobile() {
  console.log('📱 Seeding mobile data...');

  // Seed mobile app versions
  const appVersionIds = await Promise.all([
    db.insert(mobileAppVersions).values({
      version: '1.0.0',
      build_number: '100',
      platform: 'ios',
      release_notes: 'Initial release with core functionality',
      download_url: 'https://apps.apple.com/app/id123456789',
      min_required_version: '1.0.0',
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileAppVersions.id }),
    db.insert(mobileAppVersions).values({
      version: '1.0.0',
      build_number: '100',
      platform: 'android',
      release_notes: 'Initial release with core functionality',
      download_url: 'https://play.google.com/store/apps/details?id=com.company.app',
      min_required_version: '1.0.0',
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileAppVersions.id }),
  ]);

  // Seed mobile devices
  const deviceIds = await Promise.all([
    db.insert(mobileDevices).values({
      device_id: 'ios-device-001',
      user_id: 'user-1',
      device_name: 'iPhone 15 Pro',
      platform: 'ios',
      os_version: '17.2.1',
      app_version: '1.0.0',
      device_token: 'ios-device-token-123',
      push_enabled: true,
      last_active: new Date(),
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileDevices.id }),
    db.insert(mobileDevices).values({
      device_id: 'android-device-001',
      user_id: 'user-2',
      device_name: 'Samsung Galaxy S24',
      platform: 'android',
      os_version: '14.0',
      app_version: '1.0.0',
      device_token: 'android-device-token-456',
      push_enabled: true,
      last_active: new Date(),
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileDevices.id }),
    db.insert(mobileDevices).values({
      device_id: 'ios-device-002',
      user_id: 'user-3',
      device_name: 'iPad Pro',
      platform: 'ios',
      os_version: '17.2.1',
      app_version: '1.0.0',
      device_token: 'ios-device-token-789',
      push_enabled: false,
      last_active: new Date('2024-01-10'),
      status: 'inactive',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileDevices.id }),
  ]);

  // Seed mobile configurations
  const configIds = await Promise.all([
    db.insert(mobileConfigurations).values({
      name: 'Default Configuration',
      description: 'Default mobile app configuration',
      platform: 'all',
      configuration: {
        theme: 'light',
        language: 'en',
        notifications: {
          push_enabled: true,
          email_enabled: true,
          sms_enabled: false,
        },
        features: {
          offline_mode: true,
          biometric_auth: true,
          dark_mode: true,
        },
        sync: {
          auto_sync: true,
          sync_interval: 300,
          data_limit: 100,
        },
      },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileConfigurations.id }),
    db.insert(mobileConfigurations).values({
      name: 'Field Worker Configuration',
      description: 'Configuration optimized for field workers',
      platform: 'all',
      configuration: {
        theme: 'auto',
        language: 'en',
        notifications: {
          push_enabled: true,
          email_enabled: false,
          sms_enabled: true,
        },
        features: {
          offline_mode: true,
          biometric_auth: false,
          dark_mode: true,
          gps_tracking: true,
        },
        sync: {
          auto_sync: true,
          sync_interval: 600,
          data_limit: 50,
        },
      },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: mobileConfigurations.id }),
  ]);

  // Seed mobile sessions
  await Promise.all([
    db.insert(mobileSessions).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      session_token: 'session-token-123',
      start_time: new Date('2024-01-15T08:00:00Z'),
      end_time: new Date('2024-01-15T17:00:00Z'),
      duration: 32400,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X)',
      location: { lat: 40.7128, lng: -74.0060 },
      status: 'completed',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileSessions).values({
      device_id: deviceIds[1].id,
      user_id: 'user-2',
      session_token: 'session-token-456',
      start_time: new Date('2024-01-15T09:00:00Z'),
      end_time: null,
      duration: 0,
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B)',
      location: { lat: 34.0522, lng: -118.2437 },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed mobile notifications
  await Promise.all([
    db.insert(mobileNotifications).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      title: 'Order Update',
      message: 'Your order #12345 has been shipped',
      notification_type: 'order_update',
      priority: 'normal',
      data: {
        order_id: '12345',
        tracking_number: 'TRK123456789',
        estimated_delivery: '2024-01-17',
      },
      sent_at: new Date('2024-01-15T10:30:00Z'),
      delivered_at: new Date('2024-01-15T10:30:05Z'),
      read_at: new Date('2024-01-15T10:35:00Z'),
      status: 'read',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileNotifications).values({
      device_id: deviceIds[1].id,
      user_id: 'user-2',
      title: 'Inventory Alert',
      message: 'Low stock alert for SKU ABC123',
      notification_type: 'inventory_alert',
      priority: 'high',
      data: {
        sku: 'ABC123',
        current_stock: 5,
        reorder_point: 10,
      },
      sent_at: new Date('2024-01-15T11:00:00Z'),
      delivered_at: new Date('2024-01-15T11:00:03Z'),
      read_at: null,
      status: 'delivered',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileNotifications).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      title: 'Task Assignment',
      message: 'New task assigned: Warehouse inventory count',
      notification_type: 'task_assignment',
      priority: 'normal',
      data: {
        task_id: 'task-789',
        task_type: 'inventory_count',
        due_date: '2024-01-16',
      },
      sent_at: new Date('2024-01-15T14:00:00Z'),
      delivered_at: null,
      read_at: null,
      status: 'sent',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed mobile analytics
  await Promise.all([
    db.insert(mobileAnalytics).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      event_type: 'app_launch',
      event_data: {
        screen: 'dashboard',
        load_time: 2.5,
        network_type: 'wifi',
      },
      timestamp: new Date('2024-01-15T08:00:00Z'),
      session_id: 'session-123',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileAnalytics).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      event_type: 'feature_usage',
      event_data: {
        feature: 'order_management',
        action: 'create_order',
        duration: 45,
      },
      timestamp: new Date('2024-01-15T09:30:00Z'),
      session_id: 'session-123',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileAnalytics).values({
      device_id: deviceIds[1].id,
      user_id: 'user-2',
      event_type: 'error',
      event_data: {
        error_code: 'NETWORK_ERROR',
        error_message: 'Connection timeout',
        screen: 'inventory',
      },
      timestamp: new Date('2024-01-15T11:15:00Z'),
      session_id: 'session-456',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed mobile permissions
  await Promise.all([
    db.insert(mobilePermissions).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      permission_type: 'location',
      granted: true,
      granted_at: new Date('2024-01-10T10:00:00Z'),
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobilePermissions).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      permission_type: 'camera',
      granted: true,
      granted_at: new Date('2024-01-10T10:00:00Z'),
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobilePermissions).values({
      device_id: deviceIds[1].id,
      user_id: 'user-2',
      permission_type: 'location',
      granted: false,
      granted_at: null,
      status: 'denied',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed mobile sync data
  await Promise.all([
    db.insert(mobileSyncData).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      data_type: 'orders',
      sync_status: 'completed',
      records_count: 150,
      last_sync: new Date('2024-01-15T08:00:00Z'),
      sync_duration: 30,
      error_count: 0,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileSyncData).values({
      device_id: deviceIds[0].id,
      user_id: 'user-1',
      data_type: 'inventory',
      sync_status: 'completed',
      records_count: 500,
      last_sync: new Date('2024-01-15T08:05:00Z'),
      sync_duration: 45,
      error_count: 2,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(mobileSyncData).values({
      device_id: deviceIds[1].id,
      user_id: 'user-2',
      data_type: 'customers',
      sync_status: 'failed',
      records_count: 0,
      last_sync: new Date('2024-01-15T09:00:00Z'),
      sync_duration: 0,
      error_count: 1,
      error_message: 'Network connection failed',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  console.log('✅ Mobile data seeded successfully');
} 