import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for DigitalOcean/nginx
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

// ==================== USERS ====================
app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows]: any = await pool.query(
      'SELECT id, username, full_name, role, photo_url FROM users WHERE username = ? AND password_hash = ?',
      [username, password]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MEMBERSHIP TYPES ====================
app.get('/api/membership-types', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM membership_types WHERE is_active = 1 ORDER BY duration_days');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/membership-types', async (req, res) => {
  try {
    const { name_en, name_mm, duration_days, price, description, color_code, is_active } = req.body;
    const [result]: any = await pool.execute(
      'INSERT INTO membership_types (name_en, name_mm, duration_days, price, description, color_code, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name_en, name_mm, duration_days, price, description || null, color_code || null, is_active !== undefined ? is_active : 1]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/membership-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_mm, duration_days, price, description, color_code, is_active } = req.body;
    await pool.execute(
      'UPDATE membership_types SET name_en = ?, name_mm = ?, duration_days = ?, price = ?, description = ?, color_code = ?, is_active = ? WHERE id = ?',
      [name_en, name_mm, duration_days, price, description || null, color_code || null, is_active, id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/membership-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM membership_types WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCT CATEGORIES ====================
app.get('/api/product-categories', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_categories ORDER BY name_en');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/product-categories', async (req, res) => {
  try {
    const { name_en, name_mm, icon } = req.body;
    const [result]: any = await pool.execute(
      'INSERT INTO product_categories (name_en, name_mm, icon) VALUES (?, ?, ?)',
      [name_en, name_mm, icon || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/product-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_mm, icon } = req.body;
    await pool.execute(
      'UPDATE product_categories SET name_en = ?, name_mm = ?, icon = ? WHERE id = ?',
      [name_en, name_mm, icon || null, id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/product-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM product_categories WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MEMBERS ====================
app.get('/api/members', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, mt.name_en as membership_name_en, mt.name_mm as membership_name_mm
      FROM members m
      LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
      ORDER BY m.id DESC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { member_code, full_name_en, full_name_mm, phone, email, gender, membership_type_id, start_date, end_date, status, join_date, photo_url, address, emergency_name, emergency_phone, nrc, dob, notes } = req.body;
    const [result]: any = await pool.execute(
      `INSERT INTO members (member_code, full_name_en, full_name_mm, phone, email, gender, membership_type_id, start_date, end_date, status, join_date, photo_url, address, emergency_name, emergency_phone, nrc, dob, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_code, full_name_en, full_name_mm || null, phone, email || null, gender, membership_type_id || null, start_date || null, end_date || null, status || 'Active', join_date, photo_url || null, address || null, emergency_name || null, emergency_phone || null, nrc || null, dob || null, notes || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name_en, full_name_mm, phone, email, gender, membership_type_id, start_date, end_date, status, photo_url, address, emergency_name, emergency_phone, nrc, dob, notes } = req.body;
    await pool.execute(
      `UPDATE members SET full_name_en = ?, full_name_mm = ?, phone = ?, email = ?, gender = ?, membership_type_id = ?, start_date = ?, end_date = ?, status = ?, photo_url = ?, address = ?, emergency_name = ?, emergency_phone = ?, nrc = ?, dob = ?, notes = ? WHERE id = ?`,
      [full_name_en, full_name_mm || null, phone, email || null, gender, membership_type_id || null, start_date || null, end_date || null, status, photo_url || null, address || null, emergency_name || null, emergency_phone || null, nrc || null, dob || null, notes || null, id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM members WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCTS ====================
app.get('/api/products', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pc.name_en as category_name_en, pc.name_mm as category_name_mm
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name_en, name_mm, category_id, sku, price, cost_price, stock, low_stock_threshold, unit, image, is_active } = req.body;
    const [result]: any = await pool.execute(
      `INSERT INTO products (name_en, name_mm, category_id, sku, price, cost_price, stock, low_stock_threshold, unit, image, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name_en, name_mm, category_id, sku || null, price, cost_price || 0, stock || 0, low_stock_threshold || 10, unit || 'pcs', image || null, is_active !== undefined ? is_active : 1]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_mm, category_id, sku, price, cost_price, stock, low_stock_threshold, unit, image, is_active } = req.body;
    await pool.execute(
      `UPDATE products SET name_en = ?, name_mm = ?, category_id = ?, sku = ?, price = ?, cost_price = ?, stock = ?, low_stock_threshold = ?, unit = ?, image = ?, is_active = ? WHERE id = ?`,
      [name_en, name_mm, category_id, sku || null, price, cost_price || 0, stock, low_stock_threshold || 10, unit || 'pcs', image || null, is_active, id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHECK-INS ====================
app.get('/api/check-ins', async (req, res) => {
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM check_ins';
    const params: any[] = [];
    if (date) {
      query += ' WHERE DATE(check_in_time) = ?';
      params.push(date);
    }
    query += ' ORDER BY check_in_time DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/check-ins', async (req, res) => {
  try {
    const { member_id, check_in_time, check_out_time, method } = req.body;
    const [result]: any = await pool.execute(
      'INSERT INTO check_ins (member_id, check_in_time, check_out_time, method) VALUES (?, ?, ?, ?)',
      [member_id, check_in_time, check_out_time || null, method || 'Manual']
    );
    res.status(201).json({ id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRANSACTIONS ====================
app.get('/api/transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT t.*, 
             GROUP_CONCAT(
               CONCAT(ti.name, ' (', ti.quantity, 'x)') SEPARATOR ', '
             ) as items_summary
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
    `;
    const params: any[] = [];
    if (startDate && endDate) {
      query += ' WHERE DATE(t.date) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    query += ' GROUP BY t.id ORDER BY t.date DESC';
    const [rows] = await pool.query(query, params);
    
    // Fetch items for each transaction
    const transactions = await Promise.all((rows as any[]).map(async (txn: any) => {
      const [items] = await pool.query(
        'SELECT * FROM transaction_items WHERE transaction_id = ?',
        [txn.id]
      );
      return { ...txn, items };
    }));
    
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by, items } = req.body;
    
    // Insert transaction
    const [txnResult]: any = await conn.execute(
      `INSERT INTO transactions (invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, member_id || null, member_name || null, type, subtotal, discount || 0, total, payment_method, date, processed_by || null]
    );
    
    const txnId = txnResult.insertId;
    
    // Insert transaction items and update stock
    for (const item of items) {
      await conn.execute(
        `INSERT INTO transaction_items (transaction_id, item_type, membership_type_id, product_id, name, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [txnId, item.type, item.membership_type_id || null, item.product_id || null, item.name, item.quantity, item.price]
      );
      
      // Decrement product stock if it's a product
      if (item.type === 'Product' && item.product_id) {
        await conn.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }
    
    await conn.commit();
    res.status(201).json({ id: txnId });
  } catch (error: any) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// ==================== STAFF ====================
app.get('/api/staff', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM staff ORDER BY id DESC');
    
    // Fetch weekly schedules for each staff
    const staffWithSchedules = await Promise.all((rows as any[]).map(async (s: any) => {
      const [schedules] = await pool.query(
        'SELECT * FROM staff_weekly_schedule WHERE staff_id = ?',
        [s.id]
      );
      
      // Convert to WeeklySchedule format
      const weeklySchedule: any = {};
      (schedules as any[]).forEach((sch: any) => {
        weeklySchedule[sch.weekday] = {
          working: sch.working === 1,
          start: sch.start,
          end: sch.end,
          shift: sch.shift
        };
      });
      
      return { ...s, weeklySchedule };
    }));
    
    res.json(staffWithSchedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { staff_code, name, role, phone, email, join_date, salary, photo_url, status, weeklySchedule } = req.body;
    
    const [result]: any = await conn.execute(
      `INSERT INTO staff (staff_code, name, role, phone, email, join_date, salary, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staff_code, name, role, phone, email || null, join_date, salary || null, photo_url || null, status || 'Active']
    );
    
    const staffId = result.insertId;
    
    // Insert weekly schedule
    if (weeklySchedule) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        const daySchedule = weeklySchedule[day];
        if (daySchedule) {
          await conn.execute(
            `INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [staffId, day, daySchedule.working ? 1 : 0, daySchedule.start || '', daySchedule.end || '', daySchedule.shift || 'Off']
          );
        }
      }
    }
    
    await conn.commit();
    res.status(201).json({ id: staffId });
  } catch (error: any) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

app.put('/api/staff/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { name, role, phone, email, salary, photo_url, status, weeklySchedule } = req.body;
    
    await conn.execute(
      `UPDATE staff SET name = ?, role = ?, phone = ?, email = ?, salary = ?, photo_url = ?, status = ? WHERE id = ?`,
      [name, role, phone, email || null, salary || null, photo_url || null, status, id]
    );
    
    // Update weekly schedule
    if (weeklySchedule) {
      await conn.execute('DELETE FROM staff_weekly_schedule WHERE staff_id = ?', [id]);
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        const daySchedule = weeklySchedule[day];
        if (daySchedule) {
          await conn.execute(
            `INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, day, daySchedule.working ? 1 : 0, daySchedule.start || '', daySchedule.end || '', daySchedule.shift || 'Off']
          );
        }
      }
    }
    
    await conn.commit();
    res.json({ success: true });
  } catch (error: any) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM staff WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STAFF ATTENDANCE ====================
app.get('/api/staff-attendance', async (req, res) => {
  try {
    const { staffId, dateFrom, dateTo } = req.query;
    let query = 'SELECT * FROM staff_attendance WHERE 1=1';
    const params: any[] = [];
    
    if (staffId) {
      query += ' AND staff_id = ?';
      params.push(staffId);
    }
    if (dateFrom) {
      query += ' AND date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND date <= ?';
      params.push(dateTo);
    }
    
    query += ' ORDER BY date DESC, clock_in DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff-attendance/clock-in', async (req, res) => {
  try {
    const { staff_id, date, clock_in, status } = req.body;
    const [result]: any = await pool.execute(
      'INSERT INTO staff_attendance (staff_id, date, clock_in, status) VALUES (?, ?, ?, ?)',
      [staff_id, date, clock_in, status || 'Working']
    );
    res.status(201).json({ id: result.insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff-attendance/clock-out/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clock_out, hours_worked, total_duration, status } = req.body;
    await pool.execute(
      'UPDATE staff_attendance SET clock_out = ?, hours_worked = ?, total_duration = ?, status = ? WHERE id = ?',
      [clock_out, hours_worked, total_duration, status || 'Completed', id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== APP SETTINGS ====================
app.get('/api/settings', async (_req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM app_settings WHERE id = 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ gym_name: 'Power Plus Gym', address: '', phone: '', currency_symbol: 'Ks', tax_rate: 0 });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { gym_name, address, phone, currency_symbol, tax_rate } = req.body;
    await pool.execute(
      `INSERT INTO app_settings (id, gym_name, address, phone, currency_symbol, tax_rate)
       VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE gym_name = ?, address = ?, phone = ?, currency_symbol = ?, tax_rate = ?`,
      [gym_name, address, phone, currency_symbol || 'Ks', tax_rate || 0, gym_name, address, phone, currency_symbol || 'Ks', tax_rate || 0]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Power Plus Gym API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Power Plus Gym API Server running on port ${PORT}`);
  console.log(`📊 Database: power_plus_gym`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

