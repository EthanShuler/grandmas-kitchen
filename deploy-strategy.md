# Deployment Strategy - AWS Lightsail

## Overview
Deploying Grandma's Kitchen to AWS Lightsail - a simple, cost-effective AWS solution that includes compute, storage, and networking for a predictable monthly price.

**Cost**: $7/month (1GB RAM, 40GB SSD, 2TB transfer)

## Prerequisites
- AWS Account
- Domain name (optional but recommended)
- GitHub repository with your code

## Architecture
```
AWS Lightsail Instance ($7/mo)
├── Node.js (Backend API on port 3001)
├── PostgreSQL Database
├── Nginx (Reverse proxy + Frontend static files)
└── PM2 (Process manager for Node)
```

## Step 1: Create Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click "Create instance"
3. Select:
   - **Platform**: Linux/Unix
   - **Blueprint**: OS Only → Ubuntu 22.04 LTS
   - **Instance plan**: $7/month (1GB RAM)
   - **Instance name**: `grandmas-kitchen`
4. Click "Create instance"

## Step 2: Configure Firewall (Networking)

1. Go to your instance → "Networking" tab
2. Under "IPv4 Firewall", add rules:
   - SSH (22) - Already added
   - HTTP (80) - Add this
   - HTTPS (443) - Add this
   - Custom (3001) - Add this (for backend during setup)

## Step 3: Connect and Setup Server

### Connect via SSH
1. In Lightsail console, click "Connect using SSH"
2. Or download SSH key and connect via terminal

### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE grandmas_kitchen;
CREATE USER kitchen_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE grandmas_kitchen TO kitchen_user;
\q
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx
```bash
sudo apt install -y nginx
```

## Step 4: Deploy Application

### Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/EthanShuler/grandmas-kitchen.git
cd grandmas-kitchen
```

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Setup Environment Variables

Create server environment file:
```bash
nano server/.env
```

Add:
```env
PORT=3001
DATABASE_URL=postgresql://kitchen_user:your_secure_password_here@localhost:5432/grandmas_kitchen
JWT_SECRET=your_very_long_random_secret_key_here_min_32_chars
NODE_ENV=production
```

Create client environment file:
```bash
nano client/.env
```

Add:
```env
VITE_API_URL=http://your-lightsail-ip:3001/api
```

### Initialize Database
```bash
# Run schema
sudo -u postgres psql -d grandmas_kitchen -f server/src/db/schema.sql
```

### Build Client
```bash
cd client
npm run build
cd ..
```

## Step 5: Configure Nginx

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/grandmas-kitchen
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or your Lightsail IP

    # Frontend
    location / {
        root /home/ubuntu/grandmas-kitchen/client/build/client;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/grandmas-kitchen /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

## Step 6: Start Backend with PM2

```bash
cd /home/ubuntu/grandmas-kitchen/server
pm2 start src/index.ts --name grandmas-kitchen-api --interpreter tsx
pm2 save
pm2 startup  # Follow the instructions it gives you
```

## Step 7: Setup Domain (Optional)

### Option A: Use Lightsail DNS
1. In Lightsail console, go to "Networking" → "DNS zones"
2. Create DNS zone for your domain
3. Add A record pointing to your instance's IP
4. Update your domain registrar's nameservers

### Option B: Use Route 53 or other DNS
1. Create an A record pointing to your Lightsail static IP
2. Wait for DNS propagation (5-30 minutes)

## Step 8: Setup SSL with Let's Encrypt (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow prompts, it will automatically configure HTTPS.

Update client `.env`:
```bash
nano client/.env
```

Change to:
```env
VITE_API_URL=https://your-domain.com/api
```

Rebuild client:
```bash
cd client
npm run build
cd ..
```

## Step 9: Setup Automatic Deployments (Optional)

Create deploy script:
```bash
nano /home/ubuntu/deploy.sh
```

Add:
```bash
#!/bin/bash
cd /home/ubuntu/grandmas-kitchen

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Build client
cd client
npm run build
cd ..

# Restart backend
pm2 restart grandmas-kitchen-api

echo "Deployment complete!"
```

Make executable:
```bash
chmod +x /home/ubuntu/deploy.sh
```

To deploy updates:
```bash
./deploy.sh
```

## Maintenance Commands

### Check Backend Status
```bash
pm2 status
pm2 logs grandmas-kitchen-api
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test config
```

### Check PostgreSQL
```bash
sudo -u postgres psql
\l  # List databases
\c grandmas_kitchen  # Connect to database
\dt  # List tables
```

### Restart Services
```bash
pm2 restart grandmas-kitchen-api
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### View Logs
```bash
pm2 logs grandmas-kitchen-api
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Backup Strategy

### Database Backup
```bash
# Create backup directory
mkdir -p /home/ubuntu/backups

# Create backup script
nano /home/ubuntu/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump grandmas_kitchen > $BACKUP_DIR/db_backup_$TIMESTAMP.sql
# Keep only last 7 backups
ls -t $BACKUP_DIR/db_backup_*.sql | tail -n +8 | xargs rm -f
```

Make executable and add to cron:
```bash
chmod +x /home/ubuntu/backup-db.sh
crontab -e
```

Add line (daily backup at 2 AM):
```
0 2 * * * /home/ubuntu/backup-db.sh
```

## Monitoring

### Setup PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Check Resource Usage
```bash
htop  # or: sudo apt install htop
df -h  # Disk space
free -m  # Memory
```

## Troubleshooting

### Backend won't start
```bash
pm2 logs grandmas-kitchen-api
# Check for port conflicts
sudo lsof -i :3001
```

### Frontend shows 404
```bash
# Check Nginx config
sudo nginx -t
# Check if files exist
ls -la /home/ubuntu/grandmas-kitchen/client/build/client
```

### Database connection error
```bash
# Test connection
sudo -u postgres psql -d grandmas_kitchen
# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### Can't connect to site
- Check firewall rules in Lightsail console
- Verify Nginx is running: `sudo systemctl status nginx`
- Check DNS propagation: `nslookup your-domain.com`

## Costs Breakdown

- **Lightsail Instance**: $7/month
- **Data Transfer**: 2TB included (plenty for family site)
- **Static IP**: Free with instance
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$7/month

## Scaling Options

If traffic grows:
- Upgrade to $12/month plan (2GB RAM)
- Add Lightsail Load Balancer ($18/mo)
- Migrate database to RDS
- Use S3 + CloudFront for images
