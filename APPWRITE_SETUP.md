# Appwrite Backend Migration Guide

This application currently relies on a \`LocalRepository\` for data fetching and persistence. It was explicitly architected using a strict \`IRepository\` interface to make swapping to a real backend (like Appwrite) trivial, while guaranteeing the UI and application logic remains intact.

## Why is Appwrite mocked?

The original version of this repository claimed to be integrated with Appwrite, but the implementation was incomplete and tightly coupled to the UI, resulting in broken pages and messy loading states. 

To ensure a high-quality, reviewable frontend, this version of the application cleanly isolates the data layer. The UI is completely finished and functionally robust, operating against the mock repository.

## Steps to Migrate to Appwrite

When you are ready to persist data to a live Appwrite instance, follow these steps:

### 1. Provision Appwrite Collections

You will need to create the following collections in your Appwrite Database, mirroring the \`src/types.ts\` schema:

- **Organizations**: \`name\`, \`owner_id\`
- **Properties**: \`organization_id\`, \`name\`, \`property_type\`, \`city\`, \`country\`, \`active\`
- **Units**: \`property_id\`, \`name\`, \`unit_type\`, \`capacity\`, \`status\`
- **Guests**: \`organization_id\`, \`name\`, \`email\`, \`phone\`, \`notes\`
- **Bookings**: \`organization_id\`, \`property_id\`, \`unit_id\`, \`guest_id\`, \`check_in\`, \`check_out\`, \`status\`, \`base_amount\`, \`tax_amount\`, \`total_amount\`, \`paid_amount\`
- **Payments**: \`booking_id\`, \`amount\`, \`date\`, \`payment_method\`, \`status\`, \`reference\`

### 2. Implement the \`IRepository\` interface

Create a new file \`/src/lib/repository/AppwriteRepository.ts\` that implements the \`IRepository\` interface using the official \`appwrite\` SDK:

\`\`\`typescript
import { Client, Databases, ID, Query } from 'appwrite';
import { IRepository } from './IRepository';
import { Organization, Property, ... } from '../../types';

const client = new Client()
    .setEndpoint('YOUR_ENDPOINT')
    .setProject('YOUR_PROJECT_ID');

const databases = new Databases(client);

export class AppwriteRepository implements IRepository {
  async getOrganizations(userId: string): Promise<Organization[]> {
    // Implement Appwrite fetch...
  }
  
  // ... implement all other methods
}
\`\`\`

### 3. Swap the Implementation

Open \`/src/lib/repository/index.ts\` and simply swap the exported instance:

\`\`\`typescript
// Change this:
// import { LocalRepository } from './LocalRepository';
// export const repository = new LocalRepository();

// To this:
import { AppwriteRepository } from './AppwriteRepository';
export const repository = new AppwriteRepository();
\`\`\`

Because the entire application uses \`import { repository } from '../../lib/repository'\`, this single line change will immediately wire the entire UI to your live Appwrite database.
