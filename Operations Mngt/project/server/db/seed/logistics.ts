import { db } from '../index';
import { logisticsTasks, logisticsRoutes, logisticsEquipment, logisticsPerformance, logisticsSchedules, logisticsZones, logisticsWorkflows } from '../schema/logistics';

export async function seedLogistics() {
  console.log('🌐 Seeding logistics data...');

  // Seed logistics zones
  const zoneIds = await Promise.all([
    db.insert(logisticsZones).values({
      name: 'North Zone',
      description: 'Northern logistics zone covering major cities',
      boundaries: { type: 'polygon', coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] },
      capacity: 1000,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsZones.id }),
    db.insert(logisticsZones).values({
      name: 'South Zone',
      description: 'Southern logistics zone for regional distribution',
      boundaries: { type: 'polygon', coordinates: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]] },
      capacity: 800,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsZones.id }),
    db.insert(logisticsZones).values({
      name: 'East Zone',
      description: 'Eastern logistics zone for coastal operations',
      boundaries: { type: 'polygon', coordinates: [[[2, 0], [2, 1], [3, 1], [3, 0], [2, 0]]] },
      capacity: 1200,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsZones.id }),
  ]);

  // Seed logistics equipment
  const equipmentIds = await Promise.all([
    db.insert(logisticsEquipment).values({
      name: 'Truck-001',
      type: 'delivery_truck',
      model: 'Ford F-650',
      capacity: 5000,
      status: 'available',
      location: 'Warehouse A',
      maintenance_schedule: { next_service: '2024-02-15', last_service: '2024-01-15' },
      fuel_level: 85,
      driver_id: 'driver-1',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsEquipment.id }),
    db.insert(logisticsEquipment).values({
      name: 'Forklift-001',
      type: 'forklift',
      model: 'Toyota 8FGCU25',
      capacity: 2500,
      status: 'in_use',
      location: 'Warehouse B',
      maintenance_schedule: { next_service: '2024-03-01', last_service: '2024-02-01' },
      fuel_level: 60,
      driver_id: 'driver-2',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsEquipment.id }),
    db.insert(logisticsEquipment).values({
      name: 'Van-001',
      type: 'delivery_van',
      model: 'Mercedes Sprinter',
      capacity: 2000,
      status: 'maintenance',
      location: 'Service Center',
      maintenance_schedule: { next_service: '2024-02-20', last_service: '2024-01-20' },
      fuel_level: 20,
      driver_id: 'driver-3',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsEquipment.id }),
  ]);

  // Seed logistics routes
  const routeIds = await Promise.all([
    db.insert(logisticsRoutes).values({
      name: 'North City Route',
      description: 'Primary route for north city deliveries',
      start_location: 'Warehouse A',
      end_location: 'North Distribution Center',
      waypoints: [
        { lat: 40.7128, lng: -74.0060, name: 'Checkpoint 1' },
        { lat: 40.7589, lng: -73.9851, name: 'Checkpoint 2' },
      ],
      distance: 25.5,
      estimated_duration: 45,
      zone_id: zoneIds[0].id,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsRoutes.id }),
    db.insert(logisticsRoutes).values({
      name: 'South Regional Route',
      description: 'Route for southern regional distribution',
      start_location: 'Warehouse B',
      end_location: 'South Hub',
      waypoints: [
        { lat: 34.0522, lng: -118.2437, name: 'LA Checkpoint' },
        { lat: 32.7157, lng: -117.1611, name: 'SD Checkpoint' },
      ],
      distance: 120.0,
      estimated_duration: 180,
      zone_id: zoneIds[1].id,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: logisticsRoutes.id }),
  ]);

  // Seed logistics tasks
  await Promise.all([
    db.insert(logisticsTasks).values({
      title: 'Morning Delivery Run',
      description: 'Deliver packages to north city customers',
      type: 'delivery',
      priority: 'high',
      status: 'in_progress',
      assigned_to: 'driver-1',
      equipment_id: equipmentIds[0].id,
      route_id: routeIds[0].id,
      start_time: new Date('2024-01-15T08:00:00Z'),
      end_time: new Date('2024-01-15T12:00:00Z'),
      estimated_duration: 240,
      actual_duration: 220,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(logisticsTasks).values({
      title: 'Warehouse Loading',
      description: 'Load trucks for afternoon deliveries',
      type: 'loading',
      priority: 'medium',
      status: 'completed',
      assigned_to: 'driver-2',
      equipment_id: equipmentIds[1].id,
      start_time: new Date('2024-01-15T06:00:00Z'),
      end_time: new Date('2024-01-15T08:00:00Z'),
      estimated_duration: 120,
      actual_duration: 110,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(logisticsTasks).values({
      title: 'Regional Distribution',
      description: 'Distribute goods to southern region',
      type: 'distribution',
      priority: 'medium',
      status: 'scheduled',
      assigned_to: 'driver-3',
      equipment_id: equipmentIds[2].id,
      route_id: routeIds[1].id,
      start_time: new Date('2024-01-16T06:00:00Z'),
      end_time: new Date('2024-01-16T18:00:00Z'),
      estimated_duration: 720,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed logistics schedules
  await Promise.all([
    db.insert(logisticsSchedules).values({
      name: 'Daily Delivery Schedule',
      description: 'Standard daily delivery operations',
      schedule_type: 'daily',
      start_time: '08:00:00',
      end_time: '18:00:00',
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      zone_id: zoneIds[0].id,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(logisticsSchedules).values({
      name: 'Weekend Operations',
      description: 'Weekend logistics operations',
      schedule_type: 'weekly',
      start_time: '09:00:00',
      end_time: '16:00:00',
      days_of_week: ['saturday', 'sunday'],
      zone_id: zoneIds[1].id,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed logistics performance
  await Promise.all([
    db.insert(logisticsPerformance).values({
      task_id: 'task-1',
      equipment_id: equipmentIds[0].id,
      driver_id: 'driver-1',
      route_id: routeIds[0].id,
      metrics: {
        fuel_consumption: 15.5,
        distance_traveled: 25.5,
        stops_completed: 8,
        on_time_deliveries: 7,
        customer_satisfaction: 4.8,
      },
      performance_score: 92.5,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(logisticsPerformance).values({
      task_id: 'task-2',
      equipment_id: equipmentIds[1].id,
      driver_id: 'driver-2',
      metrics: {
        items_loaded: 150,
        loading_time: 110,
        efficiency_rate: 95.2,
        safety_incidents: 0,
      },
      performance_score: 88.0,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed logistics workflows
  await Promise.all([
    db.insert(logisticsWorkflows).values({
      name: 'Standard Delivery Workflow',
      description: 'Standard workflow for package deliveries',
      steps: [
        { step: 1, action: 'pickup', description: 'Pick up packages from warehouse' },
        { step: 2, action: 'route', description: 'Follow optimized route' },
        { step: 3, action: 'deliver', description: 'Deliver to customer' },
        { step: 4, action: 'confirm', description: 'Confirm delivery completion' },
      ],
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(logisticsWorkflows).values({
      name: 'Express Delivery Workflow',
      description: 'Expedited delivery workflow for urgent packages',
      steps: [
        { step: 1, action: 'priority_pickup', description: 'Priority package pickup' },
        { step: 2, action: 'direct_route', description: 'Direct route to destination' },
        { step: 3, action: 'express_deliver', description: 'Express delivery service' },
        { step: 4, action: 'immediate_confirm', description: 'Immediate delivery confirmation' },
      ],
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  console.log('✅ Logistics data seeded successfully');
} 