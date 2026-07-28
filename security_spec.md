# Security Specification: Vlaksha Crafts Security Architecture

This security specification details the attribute-based access control (ABAC) and zero-trust security structure designed for Vlaksha Crafts' Firestore database. 

## 1. Data Invariants

1. **User Ownership**: A user profile document `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid` matches the `{userId}` path parameter.
2. **PII Protection**: Personally Identifiable Information (PII) including email, phone, and detailed address fields stored in `users` and `orders` must never be readable by other unauthorized clients.
3. **Email Integrity**: Email addresses in `users` profiles must strictly match the authenticated user's email `request.auth.token.email` and require that the email is verified (`request.auth.token.email_verified == true`).
4. **Order Ownership**: An order document `/orders/{orderId}` can only be read or written by the authenticated customer who placed it (matching `email` in the payload with `request.auth.token.email`) or by a verified administrator (`harshitdhasmana39@gmail.com`).
5. **Admin Authorization**: Administrative actions (such as fetching all orders or updating an order's status and tracking notes) are strictly restricted to the verified bootstrapped administrator email `harshitdhasmana39@gmail.com` with `email_verified == true`.
6. **State Immutability**: Critical order tracking properties like `id`, `totalAmount`, `createdAt`, `email`, and `items` must remain immutable once created.
7. **Terminal State Protection**: Once an order's `orderStatus` is marked as `delivered`, client-side updates are locked. State modifications are permitted only by authorized administrators.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 JSON payloads represent attacks designed to breach the system's identity, integrity, and state bounds. All must be denied.

### Payload 1: Create/Overwrite Another User's Profile (Identity Spoofing)
*   **Target**: `/users/legitimate_user_123`
*   **Context**: Attacker signed in as `attacker_uid_456` attempts to create or overwrite a profile under another user's UID.
```json
{
  "id": "legitimate_user_123",
  "name": "Attacker Impersonator",
  "email": "legitimate@example.com",
  "phone": "+91 99999 88888",
  "address": {
    "street": "123 Fraud St",
    "city": "Bhuj",
    "state": "Gujarat",
    "zipCode": "370001",
    "country": "India"
  }
}
```

### Payload 2: Create User Profile with Unverified Email (Email Spoofing)
*   **Target**: `/users/attacker_uid_456`
*   **Context**: Attacker with an unverified email (`email_verified: false`) attempts to register a profile.
```json
{
  "id": "attacker_uid_456",
  "name": "Unverified User",
  "email": "unverified@example.com",
  "phone": "+91 99999 88888",
  "address": {
    "street": "123 Street",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  }
}
```

### Payload 3: Inject Massive Over-limit Name Field (Denial of Wallet / Resource Poisoning)
*   **Target**: `/users/attacker_uid_456`
*   **Context**: Attacker attempts to write a 1MB string into the `name` field.
```json
{
  "id": "attacker_uid_456",
  "name": "Lorem ipsum dolor sit amet... [repeated to exceed 128 characters]",
  "email": "attacker@example.com",
  "phone": "+91 99999 88888",
  "address": {
    "street": "123 St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

### Payload 4: Invalid Characters in Document Path UID (ID Poisoning)
*   **Target**: `/users/attacker_uid_%20%25$#@!`
*   **Context**: Attacker attempts to create a document with illegal URL/path injection characters in the UID.
```json
{
  "id": "attacker_uid_%20%25$#@!",
  "name": "Poison ID",
  "email": "attacker@example.com",
  "phone": "+91 99999 88888",
  "address": {
    "street": "123 St",
    "city": "Noida",
    "state": "UP",
    "zipCode": "201301",
    "country": "India"
  }
}
```

### Payload 5: Update User Profile ID Field (Immutability Violation)
*   **Target**: `/users/user_789`
*   **Context**: Legitimate user attempts to modify their immutable user profile ID to a different string.
```json
// Original ID: user_789
{
  "id": "hijacked_user_id_000",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 95481 23456",
  "address": {
    "street": "456 Oak Rd",
    "city": "Noida",
    "state": "UP",
    "zipCode": "201301",
    "country": "India"
  }
}
```

### Payload 6: Place Order for Another User's Email (Identity Spoofing)
*   **Target**: `/orders/ord-attacker-123`
*   **Context**: User signed in as `attacker@example.com` attempts to place an order with email set to `victim@example.com`.
```json
{
  "id": "ord-attacker-123",
  "customerName": "Victim User",
  "email": "victim@example.com",
  "phone": "+91 99999 77777",
  "address": {
    "street": "Victim St",
    "city": "Dehradun",
    "state": "Uttarakhand",
    "zipCode": "248001",
    "country": "India"
  },
  "items": [],
  "paymentMethod": "UPI",
  "paymentStatus": "pending",
  "orderStatus": "received",
  "totalAmount": 1500,
  "createdAt": "2026-07-15T12:00:00Z"
}
```

### Payload 7: Update Order Status to Shipped/Delivered (State Shortcutting / Privilege Escalation)
*   **Target**: `/orders/ord-1001`
*   **Context**: Standard customer attempts to self-update their own order's status to `'shipped'` or `'delivered'`.
```json
// Affected key: orderStatus
{
  "orderStatus": "delivered"
}
```

### Payload 8: Modify Order Immutable Total Amount (Immutability Violation)
*   **Target**: `/orders/ord-1001`
*   **Context**: Customer attempts to reduce the amount owed on a placed order.
```json
// Affected key: totalAmount
{
  "totalAmount": 10
}
```

### Payload 9: Place Order with Schema Violation / Unknown Keys (Shadow Fields)
*   **Target**: `/orders/ord-malformed-999`
*   **Context**: Attacker attempts to inject custom unvalidated fields (e.g., `"bypassValidation": true`) into the order schema.
```json
{
  "id": "ord-malformed-999",
  "customerName": "Hacker",
  "email": "hacker@example.com",
  "phone": "+91 99999 88888",
  "address": {
    "street": "123 St",
    "city": "Bhuj",
    "state": "Gujarat",
    "zipCode": "370001",
    "country": "India"
  },
  "items": [],
  "paymentMethod": "UPI",
  "paymentStatus": "pending",
  "orderStatus": "received",
  "totalAmount": 4500,
  "createdAt": "2026-07-15T12:00:00Z",
  "bypassValidation": true
}
```

### Payload 10: Anonymous Order Placement (Authentication Bypass)
*   **Target**: `/orders/ord-anon-000`
*   **Context**: An unauthenticated user attempts to place an order in Firestore.
```json
{
  "id": "ord-anon-000",
  "customerName": "Guest",
  "email": "guest@example.com",
  "phone": "+91 99999 88888",
  "address": {
    "street": "Guest Rd",
    "city": "Noida",
    "state": "UP",
    "zipCode": "201301",
    "country": "India"
  },
  "items": [],
  "paymentMethod": "UPI",
  "paymentStatus": "pending",
  "orderStatus": "received",
  "totalAmount": 2500,
  "createdAt": "2026-07-15T12:00:00Z"
}
```

### Payload 11: Read Another User's Order Details (PII/Query Leak)
*   **Target**: `/orders/ord-victim-888`
*   **Context**: Signed-in attacker attempts a direct query or fetch on a victim's order document.
```
GET /orders/ord-victim-888 (Attacker UID: attacker_uid_456, email: attacker@example.com)
```

### Payload 12: Delete Order Document (Unauthorized Deletion)
*   **Target**: `/orders/ord-1001`
*   **Context**: Client/Attacker attempts to delete any order records.
```
DELETE /orders/ord-1001
```

---

## 3. Security Rule Test Suite Blueprint

This TypeScript mock structure maps out the Firestore Security Rule tests verifying that all of the above Dirty Dozen payloads fail with `PERMISSION_DENIED`.

```typescript
import { assertSucceeds, assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Vlaksha Crafts Firestore Security Rules Suite', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'vlaksha-crafts-27a0d',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  describe('User collection checks', () => {
    it('Payload 1: Denies creating profile for a different user UID', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456').firestore();
      await assertFails(
        db.collection('users').doc('legitimate_user_123').set({
          id: 'legitimate_user_123',
          name: 'Attacker Impersonator',
          email: 'legitimate@example.com',
          phone: '+91 99999 88888',
          address: { street: '123 Fraud St', city: 'Bhuj', state: 'Gujarat', zipCode: '370001', country: 'India' }
        })
      );
    });

    it('Payload 2: Denies user with unverified email', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456', { email_verified: false }).firestore();
      await assertFails(
        db.collection('users').doc('attacker_uid_456').set({
          id: 'attacker_uid_456',
          name: 'Unverified User',
          email: 'unverified@example.com',
          phone: '+91 99999 88888',
          address: { street: '123 St', city: 'Delhi', state: 'Delhi', zipCode: '110001', country: 'India' }
        })
      );
    });

    it('Payload 3: Denies name string over length constraints', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456', { email_verified: true }).firestore();
      await assertFails(
        db.collection('users').doc('attacker_uid_456').set({
          id: 'attacker_uid_456',
          name: 'A'.repeat(150), // exceeds 128 characters
          email: 'attacker@example.com',
          phone: '+91 99999 88888',
          address: { street: '123 St', city: 'Noida', state: 'UP', zipCode: '201301', country: 'India' }
        })
      );
    });

    it('Payload 4: Denies UID containing poisoned character strings', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_%20%25$#@!', { email_verified: true }).firestore();
      await assertFails(
        db.collection('users').doc('attacker_uid_%20%25$#@!').set({
          id: 'attacker_uid_%20%25$#@!',
          name: 'Poison ID',
          email: 'attacker@example.com',
          phone: '+91 99999 88888',
          address: { street: '123 St', city: 'Noida', state: 'UP', zipCode: '201301', country: 'India' }
        })
      );
    });

    it('Payload 5: Denies updating immutable user ID', async () => {
      // Setup existing user
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user_789').set({
          id: 'user_789',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+91 95481 23456',
          address: { street: '456 Oak Rd', city: 'Noida', state: 'UP', zipCode: '201301', country: 'India' }
        });
      });

      const db = testEnv.authenticatedContext('user_789', { email: 'jane@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('users').doc('user_789').update({
          id: 'hijacked_user_id_000'
        })
      );
    });
  });

  describe('Order collection checks', () => {
    it('Payload 6: Denies placing order for other user emails', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456', { email: 'attacker@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('orders').doc('ord-attacker-123').set({
          id: 'ord-attacker-123',
          customerName: 'Victim User',
          email: 'victim@example.com',
          phone: '+91 99999 77777',
          address: { street: 'Victim St', city: 'Dehradun', state: 'Uttarakhand', zipCode: '248001', country: 'India' },
          items: [],
          paymentMethod: 'UPI',
          paymentStatus: 'pending',
          orderStatus: 'received',
          totalAmount: 1500,
          createdAt: '2026-07-15T12:00:00Z'
        })
      );
    });

    it('Payload 7: Denies non-admin updating order status to shipped/delivered', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord-1001').set({
          id: 'ord-1001',
          customerName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+91 99999 77777',
          address: { street: 'Victim St', city: 'Dehradun', state: 'Uttarakhand', zipCode: '248001', country: 'India' },
          items: [],
          paymentMethod: 'UPI',
          paymentStatus: 'pending',
          orderStatus: 'received',
          totalAmount: 1500,
          createdAt: '2026-07-15T12:00:00Z'
        });
      });

      const db = testEnv.authenticatedContext('user_789', { email: 'jane@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('orders').doc('ord-1001').update({
          orderStatus: 'delivered'
        })
      );
    });

    it('Payload 8: Denies non-admin modifying total amount on an order', async () => {
      const db = testEnv.authenticatedContext('user_789', { email: 'jane@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('orders').doc('ord-1001').update({
          totalAmount: 10
        })
      );
    });

    it('Payload 9: Denies placing order with shadow/unregistered fields', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456', { email: 'hacker@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('orders').doc('ord-malformed-999').set({
          id: 'ord-malformed-999',
          customerName: 'Hacker',
          email: 'hacker@example.com',
          phone: '+91 99999 88888',
          address: { street: '123 St', city: 'Bhuj', state: 'Gujarat', zipCode: '370001', country: 'India' },
          items: [],
          paymentMethod: 'UPI',
          paymentStatus: 'pending',
          orderStatus: 'received',
          totalAmount: 4500,
          createdAt: '2026-07-15T12:00:00Z',
          bypassValidation: true
        })
      );
    });

    it('Payload 10: Denies anonymous order placement', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        db.collection('orders').doc('ord-anon-000').set({
          id: 'ord-anon-000',
          customerName: 'Guest',
          email: 'guest@example.com',
          phone: '+91 99999 88888',
          address: { street: 'Guest Rd', city: 'Noida', state: 'UP', zipCode: '201301', country: 'India' },
          items: [],
          paymentMethod: 'UPI',
          paymentStatus: 'pending',
          orderStatus: 'received',
          totalAmount: 2500,
          createdAt: '2026-07-15T12:00:00Z'
        })
      );
    });

    it('Payload 11: Denies direct read on other users orders', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456', { email: 'attacker@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('orders').doc('ord-1001').get() // ord-1001 belongs to jane@example.com
      );
    });

    it('Payload 12: Denies deleting order records entirely', async () => {
      const db = testEnv.authenticatedContext('attacker_uid_456', { email: 'attacker@example.com', email_verified: true }).firestore();
      await assertFails(
        db.collection('orders').doc('ord-1001').delete()
      );
    });
  });
});
```
