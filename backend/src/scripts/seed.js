const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Force use of Google DNS to fix 'querySrv ECONNREFUSED' issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Settings = require('../models/Settings');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { PRODUCT_TYPES, REGIONS, PLATFORMS } = require('../utils/constants');

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data from Settings, Categories, and Products...');
        await Settings.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});

        // 1. Seed Settings (Hero Banner)
        console.log('Seeding Settings...');
        const settings = [
            {
                key: 'marketing.hero_title',
                value: 'Grand Theft Auto VI',
                type: 'string',
                category: 'marketing',
                isPublic: true
            },
            {
                key: 'marketing.hero_subtitle',
                value: 'Coming 2025',
                type: 'string',
                category: 'marketing',
                isPublic: true
            },
            {
                key: 'marketing.hero_image',
                value: 'https://media-rockstargames-com.akamaized.net/m0/rockstargames/img/global/games/gta-vi/gta-vi-1.jpg',
                type: 'string',
                category: 'marketing',
                isPublic: true
            },
            {
                key: 'marketing.hero_label',
                value: 'FEATURED GAME',
                type: 'string',
                category: 'marketing',
                isPublic: true
            },
            {
                key: 'marketing.hero_button_text',
                value: 'COMING SOON',
                type: 'string',
                category: 'marketing',
                isPublic: true
            },
            {
                key: 'site.name',
                value: 'GG Store',
                type: 'string',
                category: 'general',
                isPublic: true
            }
        ];
        await Settings.insertMany(settings);

        // 2. Seed Categories
        console.log('Seeding Categories...');
        const categories = await Category.insertMany([
            { name: 'Games', description: 'Digital games for all platforms', isActive: true },
            { name: 'Subscriptions', description: 'Gaming monthly and yearly subscriptions', isActive: true },
            { name: 'Gift Cards', description: 'Digital gift cards for top stores', isActive: true }
        ]);

        const gameCat = categories.find(c => c.name === 'Games')._id;
        const subCat = categories.find(c => c.name === 'Subscriptions')._id;
        const gcCat = categories.find(c => c.name === 'Gift Cards')._id;

        // 3. Seed Products
        console.log('Seeding Products...');
        const products = [
            {
                name: 'Grand Theft Auto V: Premium Edition',
                description: 'The Grand Theft Auto V: Premium Edition includes the complete Grand Theft Auto V story experience.',
                price: 29.99,
                discountPrice: 14.99,
                category: gameCat,
                type: PRODUCT_TYPES.GAME,
                region: REGIONS.GLOBAL,
                platform: PLATFORMS.PC,
                stock: 100,
                images: ['https://gaming-cdn.com/images/products/600/orig/grand-theft-auto-v-premium-online-edition-pc-game-rockstar-cover.jpg?v=1646736466'],
                isFeatured: true
            },
            {
                name: 'Cyberpunk 2077: Ultimate Edition',
                description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City.',
                price: 59.99,
                discountPrice: 35.99,
                category: gameCat,
                type: PRODUCT_TYPES.GAME,
                region: REGIONS.GLOBAL,
                platform: PLATFORMS.PC,
                stock: 50,
                images: ['https://gaming-cdn.com/images/products/15174/orig/cyberpunk-2077-ultimate-edition-ultimate-edition-pc-game-gog-com-cover.jpg?v=1701768841'],
                isFeatured: true
            },
            {
                name: 'PlayStation Plus Essential 12 Months',
                description: 'Get monthly games, online multiplayer, and more with PS Plus.',
                price: 79.99,
                category: subCat,
                type: PRODUCT_TYPES.SUBSCRIPTION,
                region: REGIONS.USA,
                platform: PLATFORMS.PLAYSTATION,
                stock: 500,
                images: ['https://gaming-cdn.com/images/products/2192/orig/playstation-plus-card-365-days-usa-usa-cover.jpg?v=1644919532']
            },
            {
                name: 'Xbox Game Pass Ultimate 3 Months',
                description: 'Play hundreds of high-quality games with friends on console, PC, and cloud.',
                price: 44.99,
                category: subCat,
                type: PRODUCT_TYPES.SUBSCRIPTION,
                region: REGIONS.GLOBAL,
                platform: PLATFORMS.XBOX,
                stock: 200,
                images: ['https://gaming-cdn.com/images/products/4475/orig/xbox-game-pass-ultimate-3-months-cover.jpg?v=1645003503']
            }
        ];
        await Product.insertMany(products);

        console.log('\n=========================================');
        console.log('Database seeded successfully!');
        console.log('Added 6 Settings, 3 Categories, and 4 Products.');
        console.log('=========================================\n');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
