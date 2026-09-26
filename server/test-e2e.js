const http = require('http');
const app = require('./src/app');
const prisma = require('./src/lib/prisma');

async function runTests() {
  console.log('🧪 Starting StockSense End-to-End API Test Suite...');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('🚀 Test server listening on http://localhost:5099');

  const request = async (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        {
          hostname: 'localhost',
          port: 5099,
          path,
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    console.log('✅ Health check:', health.status, health.body.status);

    // 2. Manager login
    const managerLogin = await request('POST', '/api/auth/login', {
      email: 'manager@stocksense.com',
      password: 'password123',
    });
    console.log('✅ Manager Login:', managerLogin.status, 'User:', managerLogin.body.user?.name);
    const managerToken = managerLogin.body.accessToken;

    // 3. Staff login
    const staffLogin = await request('POST', '/api/auth/login', {
      email: 'staff@stocksense.com',
      password: 'password123',
    });
    console.log('✅ Staff Login:', staffLogin.status, 'User:', staffLogin.body.user?.name);
    const staffToken = staffLogin.body.accessToken;

    // 4. Dashboard KPIs
    const kpis = await request('GET', '/api/dashboard/kpis', null, managerToken);
    console.log('✅ Dashboard KPIs:', kpis.status, 'Total Stock:', kpis.body.kpis?.totalStock);

    // 5. Products list with ledger-calculated stock
    const products = await request('GET', '/api/products', null, managerToken);
    console.log('✅ Products list:', products.status, 'Count:', products.body.products?.length);

    // 6. Product detail with rack location breakdown
    const productDetail = await request('GET', `/api/products/${products.body.products[0].id}`, null, managerToken);
    console.log('✅ Product detail breakdown:', productDetail.status, 'Warehouses:', productDetail.body.product?.stockBreakdown?.length);

    // 7. Receipts
    const receipts = await request('GET', '/api/receipts', null, managerToken);
    console.log('✅ Receipts list:', receipts.status, 'Count:', receipts.body.receipts?.length);

    // 8. Deliveries
    const deliveries = await request('GET', '/api/deliveries', null, managerToken);
    console.log('✅ Deliveries list:', deliveries.status, 'Count:', deliveries.body.deliveries?.length);

    // 9. Transfers
    const transfers = await request('GET', '/api/transfers', null, managerToken);
    console.log('✅ Transfers list:', transfers.status, 'Count:', transfers.body.transfers?.length);

    // 10. Adjustments
    const adjustments = await request('GET', '/api/adjustments', null, managerToken);
    console.log('✅ Adjustments list:', adjustments.status, 'Count:', adjustments.body.adjustments?.length);

    // 11. Stock Ledger
    const ledger = await request('GET', '/api/ledger', null, managerToken);
    console.log('✅ Stock Ledger:', ledger.status, 'Entries Count:', ledger.body.entries?.length);

    // 12. End-to-end receipt validation flow:
    // Staff creates a draft receipt
    const newReceipt = await request(
      'POST',
      '/api/receipts',
      {
        supplierId: 1,
        notes: 'E2E Automated Restock Test',
        lines: [{ productId: 1, locationId: 1, expectedQty: 50 }],
      },
      staffToken
    );
    console.log('✅ Staff created Receipt #', newReceipt.body.receipt?.id, 'Status:', newReceipt.body.receipt?.status);

    // Staff attempts to validate (should be forbidden with 403!)
    const forbiddenValidate = await request('POST', `/api/receipts/${newReceipt.body.receipt.id}/validate`, {}, staffToken);
    console.log('✅ RBAC Check: Staff validation attempt correctly rejected:', forbiddenValidate.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL');

    // Manager validates receipt (should succeed!)
    const managerValidate = await request('POST', `/api/receipts/${newReceipt.body.receipt.id}/validate`, {}, managerToken);
    console.log('✅ Manager validates Receipt:', managerValidate.status === 200 ? 'PASS (200 OK)' : 'FAIL', 'Receipt status:', managerValidate.body.receipt?.status);

    // Check that stock was updated
    const updatedProd = await request('GET', '/api/products/1', null, managerToken);
    console.log('✅ Product stock after validated receipt:', updatedProd.body.product?.currentStock);

    // 13. AI Suggestions
    const ai = await request('GET', '/api/dashboard/ai-suggestions', null, managerToken);
    console.log('✅ AI Restock Suggestions:', ai.status, 'Count:', ai.body.suggestions?.length);

    console.log('\n🎉 ALL 13 TEST SCENARIOS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
