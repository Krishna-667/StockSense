const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in proper dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.adjustmentLine.deleteMany();
  await prisma.adjustment.deleteMany();
  await prisma.transferLine.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.deliveryLine.deleteMany();
  await prisma.deliveryOrder.deleteMany();
  await prisma.receiptLine.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.reorderRule.deleteMany();
  await prisma.product.deleteMany();
  await prisma.location.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.unitOfMeasure.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 1. Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const manager = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'manager@stocksense.com',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'John Miller',
      email: 'staff@stocksense.com',
      passwordHash,
      role: 'STAFF',
    },
  });

  console.log('👤 Created users: manager@stocksense.com & staff@stocksense.com');

  // 2. Warehouses
  const mainWh = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',
      address: '100 Industrial Parkway, Sector 4, Chicago, IL',
      isActive: true,
    },
  });

  const prodWh = await prisma.warehouse.create({
    data: {
      name: 'Production Floor',
      address: 'Building B, Manufacturing Wing, Chicago, IL',
      isActive: true,
    },
  });

  const overflowWh = await prisma.warehouse.create({
    data: {
      name: 'Overflow Depot',
      address: '77 Logistics Blvd, North Hub, Chicago, IL',
      isActive: true,
    },
  });

  // 3. Locations
  const locMainA1 = await prisma.location.create({
    data: { warehouseId: mainWh.id, name: 'Rack A-01', aisle: 'A', rack: '01', shelf: '1' },
  });
  const locMainA2 = await prisma.location.create({
    data: { warehouseId: mainWh.id, name: 'Rack A-02', aisle: 'A', rack: '02', shelf: '2' },
  });
  const locMainB1 = await prisma.location.create({
    data: { warehouseId: mainWh.id, name: 'Rack B-01', aisle: 'B', rack: '01', shelf: '1' },
  });
  const locMainBulk = await prisma.location.create({
    data: { warehouseId: mainWh.id, name: 'Bulk Floor', aisle: 'C', rack: 'Bulk', shelf: 'Ground' },
  });

  const locProdRack1 = await prisma.location.create({
    data: { warehouseId: prodWh.id, name: 'Assembly Rack 1', aisle: 'P', rack: '01', shelf: '1' },
  });
  const locProdStage = await prisma.location.create({
    data: { warehouseId: prodWh.id, name: 'Staging Floor', aisle: 'P', rack: 'Stage', shelf: 'Ground' },
  });

  const locOverBay1 = await prisma.location.create({
    data: { warehouseId: overflowWh.id, name: 'High Bay 01', aisle: 'O', rack: '01', shelf: 'High' },
  });

  // 4. Categories
  const catRaw = await prisma.productCategory.create({
    data: { name: 'Raw Materials' },
  });
  const catMetals = await prisma.productCategory.create({
    data: { name: 'Metals', parentId: catRaw.id },
  });
  const catChemicals = await prisma.productCategory.create({
    data: { name: 'Chemicals', parentId: catRaw.id },
  });

  const catParts = await prisma.productCategory.create({
    data: { name: 'Components & Parts' },
  });
  const catElectrical = await prisma.productCategory.create({
    data: { name: 'Electrical', parentId: catParts.id },
  });
  const catMechanical = await prisma.productCategory.create({
    data: { name: 'Mechanical', parentId: catParts.id },
  });

  const catPackaging = await prisma.productCategory.create({
    data: { name: 'Packaging' },
  });

  // 5. Units of Measure
  const uomKg = await prisma.unitOfMeasure.create({ data: { name: 'Kilogram', abbreviation: 'kg' } });
  const uomPcs = await prisma.unitOfMeasure.create({ data: { name: 'Pieces', abbreviation: 'pcs' } });
  const uomM = await prisma.unitOfMeasure.create({ data: { name: 'Meter', abbreviation: 'm' } });
  const uomBox = await prisma.unitOfMeasure.create({ data: { name: 'Box', abbreviation: 'box' } });
  const uomL = await prisma.unitOfMeasure.create({ data: { name: 'Liter', abbreviation: 'L' } });

  // 6. Suppliers & Customers
  const supAcme = await prisma.supplier.create({
    data: {
      name: 'Acme Industrial Metals',
      email: 'supply@acmemetals.com',
      phone: '+1 (555) 234-5678',
      address: '800 Forge Way, Cleveland, OH',
    },
  });
  const supSilicon = await prisma.supplier.create({
    data: {
      name: 'Global Silicon & Wire',
      email: 'orders@globalsilicon.com',
      phone: '+1 (555) 345-6789',
      address: '120 Semiconductor Blvd, San Jose, CA',
    },
  });
  const supPinnacle = await prisma.supplier.create({
    data: {
      name: 'Pinnacle Packaging Co.',
      email: 'sales@pinnaclepack.com',
      phone: '+1 (555) 456-7890',
      address: '450 Carton Road, Atlanta, GA',
    },
  });

  const custApex = await prisma.customer.create({
    data: {
      name: 'Apex Manufacturing Ltd.',
      email: 'procurement@apexmanuf.com',
      phone: '+1 (555) 876-5432',
      address: '2200 Motor City Dr, Detroit, MI',
    },
  });
  const custHorizon = await prisma.customer.create({
    data: {
      name: 'Horizon Dynamics Inc.',
      email: 'orders@horizondyn.com',
      phone: '+1 (555) 765-4321',
      address: '500 Innovation Way, Austin, TX',
    },
  });
  const custSummit = await prisma.customer.create({
    data: {
      name: 'Summit Infrastructure',
      email: 'supply@summitinfra.com',
      phone: '+1 (555) 654-3210',
      address: '900 Alpine Blvd, Denver, CO',
    },
  });

  // 7. Products
  const pSteel = await prisma.product.create({
    data: {
      name: 'Steel Rods 20mm',
      sku: 'MET-STL-001',
      categoryId: catMetals.id,
      uomId: uomKg.id,
      reorderLevel: 250,
      description: 'High-tensile hardened structural carbon steel rods 20mm x 3m.',
    },
  });

  const pAluminum = await prisma.product.create({
    data: {
      name: 'Aluminum Sheets 4x8',
      sku: 'MET-ALU-002',
      categoryId: catMetals.id,
      uomId: uomPcs.id,
      reorderLevel: 60,
      description: 'Marine-grade 6061-T6 aluminum sheet plates 4ft x 8ft.',
    },
  });

  const pCopper = await prisma.product.create({
    data: {
      name: 'Copper Grounding Wire 10AWG',
      sku: 'ELC-CPR-003',
      categoryId: catElectrical.id,
      uomId: uomM.id,
      reorderLevel: 200,
      description: 'Solid bare copper electrical grounding wire spool.',
    },
  });

  const pBattery = await prisma.product.create({
    data: {
      name: 'Lithium Battery Pack 48V',
      sku: 'ELC-BAT-004',
      categoryId: catElectrical.id,
      uomId: uomPcs.id,
      reorderLevel: 30, // currently low stock for demo!
      description: 'Modular high-capacity LiFePO4 battery pack 48V 100Ah with smart BMS.',
    },
  });

  const pBearing = await prisma.product.create({
    data: {
      name: 'Industrial Bearings 6204',
      sku: 'MEC-BRG-005',
      categoryId: catMechanical.id,
      uomId: uomPcs.id,
      reorderLevel: 50,
      description: 'Deep groove precision radial ball bearings, rubber sealed.',
    },
  });

  const pHydraulic = await prisma.product.create({
    data: {
      name: 'Hydraulic Fluid ISO 46',
      sku: 'CHM-HYD-006',
      categoryId: catChemicals.id,
      uomId: uomL.id,
      reorderLevel: 120,
      description: 'Anti-wear premium hydraulic industrial fluid barrel.',
    },
  });

  const pBox = await prisma.product.create({
    data: {
      name: 'Heavy Duty Corrugated Box',
      sku: 'PKG-BOX-007',
      categoryId: catPackaging.id,
      uomId: uomBox.id,
      reorderLevel: 400,
      description: 'Double-wall heavy duty shipping boxes (24x18x18 in).',
    },
  });

  const pFasteners = await prisma.product.create({
    data: {
      name: 'Titanium Fasteners M8',
      sku: 'MEC-FST-008',
      categoryId: catMechanical.id,
      uomId: uomPcs.id,
      reorderLevel: 100, // zero / out of stock for demo!
      description: 'Grade 5 aerospace titanium socket head cap screws.',
    },
  });

  console.log('📦 Created 8 diverse products across multiple categories.');

  // 8. Reorder Rules
  await prisma.reorderRule.createMany({
    data: [
      { productId: pSteel.id, warehouseId: mainWh.id, minQuantity: 250, reorderQuantity: 500 },
      { productId: pAluminum.id, warehouseId: mainWh.id, minQuantity: 60, reorderQuantity: 150 },
      { productId: pBattery.id, warehouseId: mainWh.id, minQuantity: 30, reorderQuantity: 60 },
      { productId: pCopper.id, warehouseId: mainWh.id, minQuantity: 200, reorderQuantity: 400 },
      { productId: pFasteners.id, warehouseId: mainWh.id, minQuantity: 100, reorderQuantity: 1000 },
    ],
  });

  // 9. Historical Stock Ledger & Operational Documents
  // We simulate 30 days of operations leading to current stock:
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Initial Receipts (25 days ago)
  const r1 = await prisma.receipt.create({
    data: {
      supplierId: supAcme.id,
      status: 'Done',
      notes: 'Initial bulk batch delivery of structural metals',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(25),
      validatedAt: daysAgo(25),
      lines: {
        create: [
          { productId: pSteel.id, locationId: locMainBulk.id, expectedQty: 1000, receivedQty: 1000 },
          { productId: pAluminum.id, locationId: locMainA1.id, expectedQty: 200, receivedQty: 200 },
        ],
      },
    },
  });

  const r2 = await prisma.receipt.create({
    data: {
      supplierId: supSilicon.id,
      status: 'Done',
      notes: 'Electrical components and cable intake',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(20),
      validatedAt: daysAgo(20),
      lines: {
        create: [
          { productId: pCopper.id, locationId: locMainA2.id, expectedQty: 800, receivedQty: 800 },
          { productId: pBattery.id, locationId: locMainB1.id, expectedQty: 50, receivedQty: 50 },
          { productId: pBearing.id, locationId: locMainA1.id, expectedQty: 300, receivedQty: 300 },
        ],
      },
    },
  });

  const r3 = await prisma.receipt.create({
    data: {
      supplierId: supPinnacle.id,
      status: 'Done',
      notes: 'Packaging and consumables replenishment',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(14),
      validatedAt: daysAgo(14),
      lines: {
        create: [
          { productId: pBox.id, locationId: locMainBulk.id, expectedQty: 1500, receivedQty: 1500 },
          { productId: pHydraulic.id, locationId: locMainB1.id, expectedQty: 400, receivedQty: 400 },
        ],
      },
    },
  });

  // Ledger entries for Receipts
  await prisma.stockLedger.createMany({
    data: [
      { productId: pSteel.id, warehouseId: mainWh.id, locationId: locMainBulk.id, operationType: 'RECEIPT', quantityChange: 1000, referenceId: r1.id, referenceType: 'receipt', notes: 'PO #101 Acme Metals', createdBy: manager.id, createdAt: daysAgo(25) },
      { productId: pAluminum.id, warehouseId: mainWh.id, locationId: locMainA1.id, operationType: 'RECEIPT', quantityChange: 200, referenceId: r1.id, referenceType: 'receipt', notes: 'PO #101 Acme Metals', createdBy: manager.id, createdAt: daysAgo(25) },
      { productId: pCopper.id, warehouseId: mainWh.id, locationId: locMainA2.id, operationType: 'RECEIPT', quantityChange: 800, referenceId: r2.id, referenceType: 'receipt', notes: 'PO #102 Global Silicon', createdBy: manager.id, createdAt: daysAgo(20) },
      { productId: pBattery.id, warehouseId: mainWh.id, locationId: locMainB1.id, operationType: 'RECEIPT', quantityChange: 50, referenceId: r2.id, referenceType: 'receipt', notes: 'PO #102 Global Silicon', createdBy: manager.id, createdAt: daysAgo(20) },
      { productId: pBearing.id, warehouseId: mainWh.id, locationId: locMainA1.id, operationType: 'RECEIPT', quantityChange: 300, referenceId: r2.id, referenceType: 'receipt', notes: 'PO #102 Global Silicon', createdBy: manager.id, createdAt: daysAgo(20) },
      { productId: pBox.id, warehouseId: mainWh.id, locationId: locMainBulk.id, operationType: 'RECEIPT', quantityChange: 1500, referenceId: r3.id, referenceType: 'receipt', notes: 'PO #103 Pinnacle Packaging', createdBy: manager.id, createdAt: daysAgo(14) },
      { productId: pHydraulic.id, warehouseId: mainWh.id, locationId: locMainB1.id, operationType: 'RECEIPT', quantityChange: 400, referenceId: r3.id, referenceType: 'receipt', notes: 'PO #103 Pinnacle Packaging', createdBy: manager.id, createdAt: daysAgo(14) },
    ],
  });

  // Internal Transfer (10 days ago): Move some steel and batteries to Production Floor
  const t1 = await prisma.transfer.create({
    data: {
      fromWarehouseId: mainWh.id,
      toWarehouseId: prodWh.id,
      fromLocationId: locMainBulk.id,
      toLocationId: locProdStage.id,
      status: 'Done',
      notes: 'Transfer materials for scheduled assembly run #A402',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(10),
      validatedAt: daysAgo(10),
      lines: {
        create: [
          { productId: pSteel.id, quantity: 200 },
          { productId: pBattery.id, quantity: 20 },
        ],
      },
    },
  });

  await prisma.stockLedger.createMany({
    data: [
      { productId: pSteel.id, warehouseId: mainWh.id, locationId: locMainBulk.id, operationType: 'TRANSFER_OUT', quantityChange: -200, referenceId: t1.id, referenceType: 'transfer', notes: 'Transfer to Production Floor', createdBy: manager.id, createdAt: daysAgo(10) },
      { productId: pSteel.id, warehouseId: prodWh.id, locationId: locProdStage.id, operationType: 'TRANSFER_IN', quantityChange: 200, referenceId: t1.id, referenceType: 'transfer', notes: 'Transfer from Main Warehouse', createdBy: manager.id, createdAt: daysAgo(10) },
      { productId: pBattery.id, warehouseId: mainWh.id, locationId: locMainB1.id, operationType: 'TRANSFER_OUT', quantityChange: -20, referenceId: t1.id, referenceType: 'transfer', notes: 'Transfer to Production Floor', createdBy: manager.id, createdAt: daysAgo(10) },
      { productId: pBattery.id, warehouseId: prodWh.id, locationId: locProdStage.id, operationType: 'TRANSFER_IN', quantityChange: 20, referenceId: t1.id, referenceType: 'transfer', notes: 'Transfer from Main Warehouse', createdBy: manager.id, createdAt: daysAgo(10) },
    ],
  });

  // Deliveries (past 7 days) to create rich movement trends
  const d1 = await prisma.deliveryOrder.create({
    data: {
      customerId: custApex.id,
      status: 'Done',
      notes: 'Order #ORD-7721 - Structural metals and bearings',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(6),
      validatedAt: daysAgo(6),
      lines: {
        create: [
          { productId: pSteel.id, locationId: locMainBulk.id, requestedQty: 150, deliveredQty: 150 },
          { productId: pAluminum.id, locationId: locMainA1.id, requestedQty: 40, deliveredQty: 40 },
          { productId: pBearing.id, locationId: locMainA1.id, requestedQty: 80, deliveredQty: 80 },
        ],
      },
    },
  });

  const d2 = await prisma.deliveryOrder.create({
    data: {
      customerId: custHorizon.id,
      status: 'Done',
      notes: 'Order #ORD-8812 - High-spec battery and electrical shipment',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(3),
      validatedAt: daysAgo(3),
      lines: {
        create: [
          { productId: pBattery.id, locationId: locMainB1.id, requestedQty: 18, deliveredQty: 18 },
          { productId: pCopper.id, locationId: locMainA2.id, requestedQty: 250, deliveredQty: 250 },
        ],
      },
    },
  });

  const d3 = await prisma.deliveryOrder.create({
    data: {
      customerId: custSummit.id,
      status: 'Done',
      notes: 'Order #ORD-9904 - Maintenance consumables',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(1),
      validatedAt: daysAgo(1),
      lines: {
        create: [
          { productId: pHydraulic.id, locationId: locMainB1.id, requestedQty: 60, deliveredQty: 60 },
          { productId: pBox.id, locationId: locMainBulk.id, requestedQty: 300, deliveredQty: 300 },
        ],
      },
    },
  });

  await prisma.stockLedger.createMany({
    data: [
      { productId: pSteel.id, warehouseId: mainWh.id, locationId: locMainBulk.id, operationType: 'DELIVERY', quantityChange: -150, referenceId: d1.id, referenceType: 'delivery', notes: 'Apex Mfg shipment', createdBy: manager.id, createdAt: daysAgo(6) },
      { productId: pAluminum.id, warehouseId: mainWh.id, locationId: locMainA1.id, operationType: 'DELIVERY', quantityChange: -40, referenceId: d1.id, referenceType: 'delivery', notes: 'Apex Mfg shipment', createdBy: manager.id, createdAt: daysAgo(6) },
      { productId: pBearing.id, warehouseId: mainWh.id, locationId: locMainA1.id, operationType: 'DELIVERY', quantityChange: -80, referenceId: d1.id, referenceType: 'delivery', notes: 'Apex Mfg shipment', createdBy: manager.id, createdAt: daysAgo(6) },
      { productId: pBattery.id, warehouseId: mainWh.id, locationId: locMainB1.id, operationType: 'DELIVERY', quantityChange: -18, referenceId: d2.id, referenceType: 'delivery', notes: 'Horizon Dynamics order', createdBy: manager.id, createdAt: daysAgo(3) },
      { productId: pCopper.id, warehouseId: mainWh.id, locationId: locMainA2.id, operationType: 'DELIVERY', quantityChange: -250, referenceId: d2.id, referenceType: 'delivery', notes: 'Horizon Dynamics order', createdBy: manager.id, createdAt: daysAgo(3) },
      { productId: pHydraulic.id, warehouseId: mainWh.id, locationId: locMainB1.id, operationType: 'DELIVERY', quantityChange: -60, referenceId: d3.id, referenceType: 'delivery', notes: 'Summit Infra order', createdBy: manager.id, createdAt: daysAgo(1) },
      { productId: pBox.id, warehouseId: mainWh.id, locationId: locMainBulk.id, operationType: 'DELIVERY', quantityChange: -300, referenceId: d3.id, referenceType: 'delivery', notes: 'Summit Infra order', createdBy: manager.id, createdAt: daysAgo(1) },
    ],
  });

  // Physical Inventory Adjustment (4 days ago)
  const adj1 = await prisma.adjustment.create({
    data: {
      warehouseId: mainWh.id,
      locationId: locMainA1.id,
      status: 'Done',
      reason: 'Physical count audit difference',
      notes: 'Found 2 damaged aluminum sheets written off during annual safety inspection.',
      createdBy: staff.id,
      validatedBy: manager.id,
      createdAt: daysAgo(4),
      validatedAt: daysAgo(4),
      lines: {
        create: [
          { productId: pAluminum.id, recordedQty: 160, physicalQty: 158, deltaQty: -2 },
        ],
      },
    },
  });

  await prisma.stockLedger.create({
    data: {
      productId: pAluminum.id,
      warehouseId: mainWh.id,
      locationId: locMainA1.id,
      operationType: 'ADJUSTMENT',
      quantityChange: -2,
      referenceId: adj1.id,
      referenceType: 'adjustment',
      notes: 'Inspection write-off (damaged sheets)',
      createdBy: manager.id,
      createdAt: daysAgo(4),
    },
  });

  // Pending / Active operational records for testing workflow:
  // 1 Receipt in Ready
  await prisma.receipt.create({
    data: {
      supplierId: supAcme.id,
      status: 'Ready',
      notes: 'Weekly structural restock - truck arrived at dock #2',
      createdBy: staff.id,
      createdAt: daysAgo(0.5),
      lines: {
        create: [
          { productId: pSteel.id, locationId: locMainBulk.id, expectedQty: 300, receivedQty: 300 },
        ],
      },
    },
  });

  // 1 Receipt in Waiting
  await prisma.receipt.create({
    data: {
      supplierId: supSilicon.id,
      status: 'Waiting',
      notes: 'Urgent battery restock scheduled for delivery tomorrow',
      createdBy: staff.id,
      createdAt: daysAgo(0.2),
      lines: {
        create: [
          { productId: pBattery.id, locationId: locMainB1.id, expectedQty: 40, receivedQty: 0 },
        ],
      },
    },
  });

  // 1 Receipt in Draft
  await prisma.receipt.create({
    data: {
      supplierId: supPinnacle.id,
      status: 'Draft',
      notes: 'Draft carton purchase order',
      createdBy: staff.id,
      createdAt: daysAgo(0.1),
      lines: {
        create: [
          { productId: pBox.id, locationId: locMainBulk.id, expectedQty: 500, receivedQty: 0 },
        ],
      },
    },
  });

  // 1 Delivery in Ready (with stock reservation)
  await prisma.deliveryOrder.create({
    data: {
      customerId: custApex.id,
      status: 'Ready',
      notes: 'Order #ORD-9950 - Picked and ready for outbound carrier',
      createdBy: staff.id,
      createdAt: daysAgo(0.4),
      lines: {
        create: [
          { productId: pAluminum.id, locationId: locMainA1.id, requestedQty: 25, deliveredQty: 25 },
        ],
      },
    },
  });

  // 1 Delivery in Waiting
  await prisma.deliveryOrder.create({
    data: {
      customerId: custHorizon.id,
      status: 'Waiting',
      notes: 'Order #ORD-9961 - Awaiting forklift allocation for pallets',
      createdBy: staff.id,
      createdAt: daysAgo(0.2),
      lines: {
        create: [
          { productId: pSteel.id, locationId: locMainBulk.id, requestedQty: 100, deliveredQty: 0 },
        ],
      },
    },
  });

  // 1 Delivery in Draft
  await prisma.deliveryOrder.create({
    data: {
      customerId: custSummit.id,
      status: 'Draft',
      notes: 'Inquiry draft for copper wiring quote',
      createdBy: staff.id,
      createdAt: daysAgo(0.05),
      lines: {
        create: [
          { productId: pCopper.id, locationId: locMainA2.id, requestedQty: 100, deliveredQty: 0 },
        ],
      },
    },
  });

  // 1 Transfer in Draft
  await prisma.transfer.create({
    data: {
      fromWarehouseId: mainWh.id,
      toWarehouseId: overflowWh.id,
      fromLocationId: locMainBulk.id,
      toLocationId: locOverBay1.id,
      status: 'Draft',
      notes: 'Move excess boxes to Overflow depot',
      createdBy: staff.id,
      createdAt: daysAgo(0.1),
      lines: {
        create: [
          { productId: pBox.id, quantity: 400 },
        ],
      },
    },
  });

  // 1 Adjustment in Draft
  await prisma.adjustment.create({
    data: {
      warehouseId: mainWh.id,
      locationId: locMainB1.id,
      status: 'Draft',
      reason: 'Quarterly Spot Check',
      notes: 'Spot check on Battery packs in Rack B-01',
      createdBy: staff.id,
      createdAt: daysAgo(0.1),
      lines: {
        create: [
          { productId: pBattery.id, recordedQty: 12, physicalQty: 11, deltaQty: -1 },
        ],
      },
    },
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: manager.id,
        title: 'Low Stock Alert',
        message: 'Lithium Battery Pack 48V has reached 12 units (reorder level: 30 units).',
        type: 'warning',
        isRead: false,
        referenceId: pBattery.id,
        referenceType: 'product',
        createdAt: daysAgo(0.3),
      },
      {
        userId: manager.id,
        title: 'Stockout Alert',
        message: 'Titanium Fasteners M8 is currently at 0 units in all warehouses.',
        type: 'alert',
        isRead: false,
        referenceId: pFasteners.id,
        referenceType: 'product',
        createdAt: daysAgo(1),
      },
      {
        userId: manager.id,
        title: 'Pending Receipt Validation',
        message: 'Staff submitted Receipt from Acme Metals for validation.',
        type: 'info',
        isRead: false,
        referenceId: r1.id,
        referenceType: 'receipt',
        createdAt: daysAgo(0.5),
      },
      {
        userId: staff.id,
        title: 'Receipt #1 Validated',
        message: 'Manager validated Receipt #1 (+1000 Steel, +200 Aluminum).',
        type: 'success',
        isRead: true,
        referenceId: r1.id,
        referenceType: 'receipt',
        createdAt: daysAgo(25),
      },
    ],
  });

  // 11. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: manager.id,
        action: 'VALIDATE_RECEIPT',
        tableName: 'receipts',
        recordId: r1.id,
        newValues: JSON.stringify({ status: 'Done', validatedBy: manager.id }),
        ipAddress: '127.0.0.1',
        createdAt: daysAgo(25),
      },
      {
        userId: manager.id,
        action: 'VALIDATE_DELIVERY',
        tableName: 'delivery_orders',
        recordId: d1.id,
        newValues: JSON.stringify({ status: 'Done', validatedBy: manager.id }),
        ipAddress: '127.0.0.1',
        createdAt: daysAgo(6),
      },
      {
        userId: manager.id,
        action: 'VALIDATE_ADJUSTMENT',
        tableName: 'adjustments',
        recordId: adj1.id,
        newValues: JSON.stringify({ status: 'Done', delta: -2 }),
        ipAddress: '127.0.0.1',
        createdAt: daysAgo(4),
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
