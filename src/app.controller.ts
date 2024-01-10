import { Controller, Get, Render, Param, Session } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { RowDataPacket } from 'mysql2'

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'termekek',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get('cart/add/:id')
  async addToCart(@Param('id') id: string, @Session() session: Record<string, any>) {
    // Ellenőrizd, hogy a kosár már létezik-e a munkamenetben, ha nem, hozz létre egy üres tömböt
    session.cart = session.cart || [];

    // Hozzáadja az ID-t a kosárhoz, feltételezve, hogy az ID a termék azonosítója
    session.cart.push(id);

    return { message: 'Product added to cart' };
  }

  @Get()
  @Render('index')
  async index() {
    const [rows, fields] = await conn.query('SELECT * FROM termek_adatok');
    const products = rows;

    return { message: 'Welcome to the homepage', products };
  }

  @Get('cart')
  @Render('cart')
  async showCart(@Session() session: Record<string, any>) {
    const cartIds = session.cart || [];
    let total = 0;

    // Le kell kérdezni az adatbázisból a kosárban lévő termékek adatait
    if (cartIds.length > 0) {
      const placeholders = cartIds.map(() => '?').join(',');
      const [rows, fields] = await conn.query(`SELECT * FROM termek_adatok WHERE id IN (${placeholders})`, cartIds);
      const cartItems = rows as RowDataPacket[];

      // Számold ki az összértéket
      total = cartItems.reduce((sum, item) => sum + item.ar, 0);

  
    

    return { cartItems: [], total: total || 0 };
  }
}
}
