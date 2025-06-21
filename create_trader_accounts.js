import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to generate random password
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to create username from name
function createUsername(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function createTraderAccounts() {
  try {
    // Get all traders
    const tradersResult = await pool.query('SELECT id, name FROM traders ORDER BY id');
    const traders = tradersResult.rows;
    
    console.log(`Found ${traders.length} traders`);
    
    const credentials = [];
    
    for (const trader of traders) {
      const username = createUsername(trader.name);
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `trader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Check if username already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        
        if (existingUser.rows.length === 0) {
          // Create trader account
          await pool.query(`
            INSERT INTO users (id, username, email, password_hash, auth_type, user_type, role, trader_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [userId, username, `${username}@trader.local`, hashedPassword, 'local', 'trader', 'user', trader.id]);
          
          credentials.push({
            traderId: trader.id,
            traderName: trader.name,
            username: username,
            password: password
          });
          
          console.log(`Created account for ${trader.name}: ${username}`);
        } else {
          console.log(`Username ${username} already exists for ${trader.name}`);
        }
      } catch (error) {
        console.error(`Error creating account for ${trader.name}:`, error.message);
      }
    }
    
    // Write credentials to file
    let fileContent = 'TRADER LOGIN CREDENTIALS\n';
    fileContent += '=========================\n\n';
    
    credentials.forEach((cred, index) => {
      fileContent += `${index + 1}. ${cred.traderName}\n`;
      fileContent += `   Username: ${cred.username}\n`;
      fileContent += `   Password: ${cred.password}\n`;
      fileContent += `   Trader ID: ${cred.traderId}\n\n`;
    });
    
    fileContent += `\nTotal accounts created: ${credentials.length}\n`;
    fileContent += `Generated on: ${new Date().toISOString()}\n`;
    
    fs.writeFileSync('trader_credentials.txt', fileContent);
    console.log(`\nCredentials saved to trader_credentials.txt`);
    console.log(`Created ${credentials.length} trader accounts successfully`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createTraderAccounts();