import { db } from '../index';
import { 
  automationWorkflows, 
  automationTasks, 
  automationTriggers, 
  automationLogs, 
  automationSchedules, 
  automationVariables, 
  automationTemplates 
} from '../schema';
import { users } from '../schema/users';

export async function seedAutomation() {
  console.log('🌱 Seeding automation...');

  // Get existing users for references
  const existingUsers = await db.select().from(users).limit(5);

  if (existingUsers.length === 0) {
    console.log('⚠️  Skipping automation seeding - missing required references (users)');
    return;
  }

  const tenantId = existingUsers[0].tenantId;
  const createdBy = existingUsers[0].id;

  // Seed Automation Templates
  const templateData = [
    {
      tenantId,
      templateNumber: 'TEMP-001',
      name: 'Purchase Order Approval Workflow',
      description: 'Standard workflow for purchase order approval process',
      category: 'PROCUREMENT',
      type: 'WORKFLOW',
      version: '1.0',
      isDefault: true,
      isActive: true,
      template: {
        steps: [
          {
            stepNumber: 1,
            name: 'Submit PO',
            type: 'ACTION',
            action: 'submit_purchase_order',
            required: true,
            onFailure: 'STOP',
          },
          {
            stepNumber: 2,
            name: 'Manager Review',
            type: 'APPROVAL',
            assignedTo: 'manager',
            required: true,
            onFailure: 'STOP',
          },
          {
            stepNumber: 3,
            name: 'Finance Review',
            type: 'APPROVAL',
            assignedTo: 'finance',
            required: true,
            onFailure: 'STOP',
          },
          {
            stepNumber: 4,
            name: 'Send to Supplier',
            type: 'ACTION',
            action: 'send_to_supplier',
            required: true,
            onFailure: 'RETRY',
          },
        ],
      },
      parameters: [
        {
          name: 'amount_threshold',
          type: 'number',
          required: true,
          defaultValue: 10000,
          description: 'Amount threshold for approval',
        },
      ],
      tags: ['procurement', 'approval', 'workflow'],
      createdBy,
    },
    {
      tenantId,
      templateNumber: 'TEMP-002',
      name: 'Invoice Processing Workflow',
      description: 'Automated invoice processing and approval',
      category: 'FINANCE',
      type: 'WORKFLOW',
      version: '1.0',
      isDefault: true,
      isActive: true,
      template: {
        steps: [
          {
            stepNumber: 1,
            name: 'Receive Invoice',
            type: 'ACTION',
            action: 'receive_invoice',
            required: true,
            onFailure: 'STOP',
          },
          {
            stepNumber: 2,
            name: 'Validate Invoice',
            type: 'CONDITION',
            conditions: {
              amount: { $lt: 5000 },
              supplier: { $exists: true },
            },
            required: true,
            onFailure: 'ESCALATE',
          },
          {
            stepNumber: 3,
            name: 'Auto Approve',
            type: 'ACTION',
            action: 'auto_approve',
            required: false,
            onFailure: 'CONTINUE',
          },
          {
            stepNumber: 4,
            name: 'Manual Review',
            type: 'APPROVAL',
            assignedTo: 'accounts_payable',
            required: true,
            onFailure: 'STOP',
          },
        ],
      },
      parameters: [
        {
          name: 'auto_approve_limit',
          type: 'number',
          required: true,
          defaultValue: 5000,
          description: 'Auto approval limit',
        },
      ],
      tags: ['finance', 'invoice', 'automation'],
      createdBy,
    },
  ];

  const createdTemplates = await Promise.all(
    templateData.map(template => 
      db.insert(automationTemplates).values(template).returning()
    )
  );

  // Seed Automation Variables
  const variableData = [
    {
      tenantId,
      variableNumber: 'VAR-001',
      name: 'PO_APPROVAL_THRESHOLD',
      description: 'Purchase order approval threshold amount',
      type: 'NUMBER',
      value: 10000,
      defaultValue: 10000,
      isRequired: true,
      isEncrypted: false,
      scope: 'GLOBAL',
      createdBy,
    },
    {
      tenantId,
      variableNumber: 'VAR-002',
      name: 'INVOICE_AUTO_APPROVE_LIMIT',
      description: 'Invoice auto approval limit',
      type: 'NUMBER',
      value: 5000,
      defaultValue: 5000,
      isRequired: true,
      isEncrypted: false,
      scope: 'GLOBAL',
      createdBy,
    },
    {
      tenantId,
      variableNumber: 'VAR-003',
      name: 'NOTIFICATION_EMAIL_TEMPLATE',
      description: 'Default email template for notifications',
      type: 'STRING',
      value: 'default_notification_template',
      defaultValue: 'default_notification_template',
      isRequired: false,
      isEncrypted: false,
      scope: 'GLOBAL',
      createdBy,
    },
  ];

  await Promise.all(
    variableData.map(variable => 
      db.insert(automationVariables).values(variable)
    )
  );

  // Seed Automation Workflows
  const workflowData = [
    {
      tenantId,
      workflowNumber: 'WF-001',
      name: 'Purchase Order Approval',
      description: 'Automated purchase order approval workflow',
      type: 'BUSINESS_PROCESS',
      category: 'PROCUREMENT',
      status: 'ACTIVE',
      version: '1.0',
      priority: 'HIGH',
      isRecurring: false,
      maxRetries: 3,
      retryDelay: 300,
      timeout: 3600,
      steps: [
        {
          stepNumber: 1,
          name: 'Submit PO',
          type: 'ACTION',
          action: 'submit_purchase_order',
          required: true,
          onFailure: 'STOP',
        },
        {
          stepNumber: 2,
          name: 'Manager Review',
          type: 'APPROVAL',
          assignedTo: existingUsers[1]?.id,
          required: true,
          onFailure: 'STOP',
        },
        {
          stepNumber: 3,
          name: 'Finance Review',
          type: 'APPROVAL',
          assignedTo: existingUsers[2]?.id,
          required: true,
          onFailure: 'STOP',
        },
        {
          stepNumber: 4,
          name: 'Send to Supplier',
          type: 'ACTION',
          action: 'send_to_supplier',
          required: true,
          onFailure: 'RETRY',
        },
      ],
      triggers: ['po_created'],
      conditions: {
        amount: { $gt: 1000 },
      },
      createdBy,
    },
    {
      tenantId,
      workflowNumber: 'WF-002',
      name: 'Invoice Processing',
      description: 'Automated invoice processing workflow',
      type: 'BUSINESS_PROCESS',
      category: 'FINANCE',
      status: 'ACTIVE',
      version: '1.0',
      priority: 'MEDIUM',
      isRecurring: false,
      maxRetries: 3,
      retryDelay: 300,
      timeout: 3600,
      steps: [
        {
          stepNumber: 1,
          name: 'Receive Invoice',
          type: 'ACTION',
          action: 'receive_invoice',
          required: true,
          onFailure: 'STOP',
        },
        {
          stepNumber: 2,
          name: 'Validate Invoice',
          type: 'CONDITION',
          conditions: {
            amount: { $lt: 5000 },
            supplier: { $exists: true },
          },
          required: true,
          onFailure: 'ESCALATE',
        },
        {
          stepNumber: 3,
          name: 'Auto Approve',
          type: 'ACTION',
          action: 'auto_approve',
          required: false,
          onFailure: 'CONTINUE',
        },
        {
          stepNumber: 4,
          name: 'Manual Review',
          type: 'APPROVAL',
          assignedTo: existingUsers[1]?.id,
          required: true,
          onFailure: 'STOP',
        },
      ],
      triggers: ['invoice_received'],
      conditions: {
        supplier_status: 'approved',
      },
      createdBy,
    },
  ];

  const createdWorkflows = await Promise.all(
    workflowData.map(workflow => 
      db.insert(automationWorkflows).values(workflow).returning()
    )
  );

  // Seed Automation Triggers
  const triggerData = [
    {
      tenantId,
      triggerNumber: 'TRIG-001',
      name: 'PO Created Trigger',
      description: 'Triggered when a new purchase order is created',
      type: 'EVENT',
      status: 'ACTIVE',
      workflowId: createdWorkflows[0][0].id,
      eventType: 'po_created',
      eventSource: 'procurement_system',
      conditions: {
        amount: { $gt: 1000 },
      },
      createdBy,
    },
    {
      tenantId,
      triggerNumber: 'TRIG-002',
      name: 'Invoice Received Trigger',
      description: 'Triggered when a new invoice is received',
      type: 'EVENT',
      status: 'ACTIVE',
      workflowId: createdWorkflows[1][0].id,
      eventType: 'invoice_received',
      eventSource: 'finance_system',
      conditions: {
        supplier_status: 'approved',
      },
      createdBy,
    },
    {
      tenantId,
      triggerNumber: 'TRIG-003',
      name: 'Daily Report Trigger',
      description: 'Scheduled trigger for daily reports',
      type: 'SCHEDULE',
      status: 'ACTIVE',
      workflowId: createdWorkflows[0][0].id,
      schedule: '0 9 * * *', // Daily at 9 AM
      createdBy,
    },
  ];

  await Promise.all(
    triggerData.map(trigger => 
      db.insert(automationTriggers).values(trigger)
    )
  );

  // Seed Automation Schedules
  const scheduleData = [
    {
      tenantId,
      scheduleNumber: 'SCHED-001',
      name: 'Daily Report Schedule',
      description: 'Daily automated report generation',
      type: 'DAILY',
      status: 'ACTIVE',
      workflowId: createdWorkflows[0][0].id,
      cronExpression: '0 9 * * *',
      startDate: new Date('2024-01-01'),
      startTime: '09:00',
      timezone: 'UTC',
      recurrence: 'DAILY',
      createdBy,
    },
    {
      tenantId,
      scheduleNumber: 'SCHED-002',
      name: 'Weekly Cleanup Schedule',
      description: 'Weekly cleanup of old logs and data',
      type: 'WEEKLY',
      status: 'ACTIVE',
      workflowId: createdWorkflows[1][0].id,
      cronExpression: '0 2 * * 0', // Weekly on Sunday at 2 AM
      startDate: new Date('2024-01-01'),
      startTime: '02:00',
      timezone: 'UTC',
      recurrence: 'WEEKLY',
      createdBy,
    },
  ];

  await Promise.all(
    scheduleData.map(schedule => 
      db.insert(automationSchedules).values(schedule)
    )
  );

  // Seed Automation Tasks
  const taskData = [
    {
      tenantId,
      taskNumber: 'TASK-001',
      workflowId: createdWorkflows[0][0].id,
      name: 'Submit Purchase Order',
      type: 'ACTION',
      status: 'COMPLETED',
      priority: 'HIGH',
      action: 'submit_purchase_order',
      parameters: {
        po_id: 'PO-2024-001',
        amount: 5000,
      },
      assignedTo: existingUsers[0].id,
      estimatedDuration: 300,
      actualDuration: 280,
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T10:05:00Z'),
      result: {
        status: 'success',
        po_number: 'PO-2024-001',
      },
      createdBy,
    },
    {
      tenantId,
      taskNumber: 'TASK-002',
      workflowId: createdWorkflows[0][0].id,
      name: 'Manager Review',
      type: 'APPROVAL',
      status: 'COMPLETED',
      priority: 'HIGH',
      assignedTo: existingUsers[1]?.id,
      estimatedDuration: 1800,
      actualDuration: 1200,
      startTime: new Date('2024-01-15T10:05:00Z'),
      endTime: new Date('2024-01-15T10:25:00Z'),
      result: {
        status: 'approved',
        comments: 'Approved - within budget',
      },
      createdBy,
    },
    {
      tenantId,
      taskNumber: 'TASK-003',
      workflowId: createdWorkflows[1][0].id,
      name: 'Process Invoice',
      type: 'ACTION',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      action: 'process_invoice',
      parameters: {
        invoice_id: 'INV-2024-001',
        amount: 2500,
      },
      assignedTo: existingUsers[0].id,
      estimatedDuration: 600,
      startTime: new Date('2024-01-16T14:00:00Z'),
      createdBy,
    },
  ];

  await Promise.all(
    taskData.map(task => 
      db.insert(automationTasks).values(task)
    )
  );

  // Seed Automation Logs
  const logData = [
    {
      tenantId,
      logNumber: 'LOG-001',
      workflowId: createdWorkflows[0][0].id,
      taskId: taskData[0].taskNumber,
      level: 'INFO',
      message: 'Purchase order submitted successfully',
      details: {
        po_id: 'PO-2024-001',
        amount: 5000,
        supplier: 'ABC Corp',
      },
      executionId: 'exec-001',
      timestamp: new Date('2024-01-15T10:05:00Z'),
      duration: 280,
      createdBy,
    },
    {
      tenantId,
      logNumber: 'LOG-002',
      workflowId: createdWorkflows[0][0].id,
      taskId: taskData[1].taskNumber,
      level: 'INFO',
      message: 'Manager approval completed',
      details: {
        approver: existingUsers[1]?.id,
        status: 'approved',
        comments: 'Approved - within budget',
      },
      executionId: 'exec-001',
      timestamp: new Date('2024-01-15T10:25:00Z'),
      duration: 1200,
      createdBy,
    },
    {
      tenantId,
      logNumber: 'LOG-003',
      workflowId: createdWorkflows[1][0].id,
      level: 'WARN',
      message: 'Invoice validation failed - missing supplier information',
      details: {
        invoice_id: 'INV-2024-002',
        error: 'supplier_not_found',
      },
      executionId: 'exec-002',
      timestamp: new Date('2024-01-16T15:00:00Z'),
      createdBy,
    },
  ];

  await Promise.all(
    logData.map(log => 
      db.insert(automationLogs).values(log)
    )
  );

  console.log('✅ Automation seeded successfully');
} 