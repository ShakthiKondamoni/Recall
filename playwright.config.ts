import { defineConfig } from '@playwright/test';
export default defineConfig({timeout:45000,workers:1,use:{baseURL:'http://localhost:5173',trace:'retain-on-failure'},webServer:{command:'corepack pnpm dev:web',url:'http://localhost:5173',reuseExistingServer:false,timeout:90000},reporter:'list'});
