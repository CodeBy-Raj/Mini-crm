import prisma from "@/lib/prisma";

export const SeedService = {
  async seedDatabase() {
    try {
      console.log("[Seeder] Commencing safe purge of existing CRM data...");
      
      // Clean up existing records in safe cascading order
      await prisma.aIRecommendation.deleteMany({});
      await prisma.communication.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.customer.deleteMany({});
      await prisma.campaign.deleteMany({});

      console.log("[Seeder] Database clean. Commencing generation of 1000 customers...");

      const firstNames = [
        "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Jessica", "Robert", "Maria",
        "William", "Linda", "Richard", "Elizabeth", "Thomas", "Barbara", "Charles", "Susan", "Joseph",
        "Margaret", "Christopher", "Dorothy", "Daniel", "Lisa", "Matthew", "Nancy", "Donald", "Karen",
        "Mark", "Betty", "Paul", "Helen", "Steven", "Sandra", "George", "Donna", "Kenneth", "Carol",
        "Andrew", "Ruth", "Joshua", "Sharon", "Kevin", "Laura", "Brian", "Kimberly", "Ronald", "Deborah",
        "Timothy", "Jason", "Shirley", "Jeffrey", "Cynthia", "Gary", "Angela", "Ryan", "Melissa",
        "Nicholas", "Brenda", "Eric", "Amy", "Jacob", "Kathleen", "Stephen", "Amanda", "Jonathan",
        "Larry", "Justin", "Diane", "Scott", "Alice", "Brandon", "Julie", "Frank", "Heather", "Benjamin",
        "Teresa", "Gregory", "Doris", "Samuel", "Gloria", "Raymond", "Evelyn", "Patrick", "Cheryl",
        "Alexander", "Mildred", "Jack", "Katherine", "Dennis", "Joan", "Jerry", "Ashley", "Tyler", "Kelly"
      ];

      const lastNames = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
        "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
        "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
        "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
        "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
        "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards",
        "Collins", "Reyes", "Morris", "Rogers", "Abbott", "Adkins", "Aguilar", "Albert", "Alford",
        "Allison", "Alston", "Alvarado", "Alvarez", "Barrett", "Bates", "Becker", "Bell", "Bennett",
        "Benson", "Berry", "Bishop", "Black", "Blair", "Blake", "Bowen", "Bowman", "Boyd", "Bradley"
      ];

      const domains = ["gmail.com", "yahoo.com", "hotmail.com", "dundermifflin.com", "acme.corp", "enterprise.org"];

      // 1. Generate 1000 unique customers
      const customersToCreate = [];
      const emailsSeen = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        let email = `${first.toLowerCase()}.${last.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
        
        // Handle unique email constraint
        let counter = 1;
        while (emailsSeen.has(email)) {
          email = `${first.toLowerCase()}.${last.toLowerCase()}${counter}@${domains[Math.floor(Math.random() * domains.length)]}`;
          counter++;
        }
        emailsSeen.add(email);

        // Phone generation (75% have a phone, 25% don't)
        const hasPhone = Math.random() < 0.75;
        const phone = hasPhone 
          ? `+1 (${Math.floor(Math.random() * 900) + 100}) 555-${Math.floor(Math.random() * 9000) + 1000}` 
          : null;

        // Custom registration dates over the last 1-2 years
        const dateOffset = Math.floor(Math.random() * 730); // up to 2 years ago
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - dateOffset);

        customersToCreate.push({
          name: `${first} ${last}`,
          email,
          phone,
          totalSpend: 0.0,
          lastOrderDate: null,
          createdAt,
          updatedAt: createdAt,
        });
      }

      console.log(`[Seeder] Inserting 1000 customers into PostgreSQL...`);
      // Use createMany to insert rapidly
      await prisma.customer.createMany({
        data: customersToCreate,
      });

      // Fetch the generated customers back to get their IDs
      const insertedCustomers = await prisma.customer.findMany({
        select: { id: true, createdAt: true },
      });

      console.log(`[Seeder] Successfully retrieved database handles. Commencing generation of 3000 orders...`);

      // 2. Generate 3000 distributed orders
      const ordersToCreate = [];
      const now = new Date();

      for (let i = 0; i < 3000; i++) {
        // Find a random customer
        const customer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
        
        // Decide a purchase amount
        // 88% are normal purchases ($15 - $250)
        // 12% are VIP high value purchases ($500 - $1600)
        const isVIP = Math.random() < 0.12;
        const amount = isVIP 
          ? parseFloat((Math.random() * 1100 + 500).toFixed(2)) 
          : parseFloat((Math.random() * 235 + 15).toFixed(2));

        // Let's create varying order dates that are AFTER their registration date
        const regDate = new Date(customer.createdAt);
        const diffMs = now.getTime() - regDate.getTime();
        const randomMs = Math.floor(Math.random() * diffMs);
        const orderDate = new Date(regDate.getTime() + randomMs);

        ordersToCreate.push({
          customerId: customer.id,
          amount,
          createdAt: orderDate,
          updatedAt: orderDate,
        });
      }

      console.log(`[Seeder] Ingesting 3000 purchase transactions into database...`);
      await prisma.order.createMany({
        data: ordersToCreate,
      });

      console.log(`[Seeder] Updating aggregated metrics (totalSpend and lastOrderDate) in customer table...`);
      
      // Execute standard high-performance raw SQL update to link totals instead of slow JS loops
      await prisma.$executeRawUnsafe(`
        UPDATE "Customer" c
        SET "totalSpend" = COALESCE(o.total, 0.0),
            "lastOrderDate" = o.last_date
        FROM (
          SELECT "customerId", SUM(amount) as total, MAX("createdAt") as last_date
          FROM "Order"
          GROUP BY "customerId"
        ) o
        WHERE c.id = o."customerId"
      `);

      console.log("✓ Seeding finished successfully! 1,000 Customers and 3,000 Orders completed.");
      return {
        success: true,
        customersAdded: 1000,
        ordersAdded: 3000,
      };
    } catch (e: any) {
      console.error("[Seeder] Fault detected: ", e);
      throw e;
    }
  }
};
