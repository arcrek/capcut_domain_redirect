# CPanel Deployment Guide

## Quick Deploy Checklist

✅ **Upload Files** - Transfer all project files to your hosting  
✅ **Set Permissions** - Configure proper file permissions  
✅ **Test Access** - Verify the application loads correctly  
✅ **Check API** - Confirm domain API is accessible  
✅ **Verify Features** - Test all functionality (theme, language, redirects)  

## Step-by-Step Instructions

### 1. Prepare Files for Upload

Before uploading, ensure you have all required files:
```
capcut_domain_redirect/
├── index.html
├── styles/
│   ├── main.css
│   ├── themes.css
│   └── responsive.css
├── scripts/
│   ├── app.js
│   ├── api.js
│   ├── i18n.js
│   └── utils.js
├── languages/
│   ├── en.json
│   └── vi.json
└── assets/
```

### 2. Access CPanel File Manager

1. Log in to your CPanel account
2. Navigate to **Files** → **File Manager**
3. Go to `public_html` directory (or your desired subdirectory)

### 3. Upload Method A: Direct Upload

1. Select **Upload** in File Manager
2. **Drag and drop** all project files and folders
3. Wait for upload completion
4. Verify all folders and files are present

### 4. Upload Method B: Zip Upload

1. **Compress** the project folder into a ZIP file
2. Upload the ZIP file to `public_html`
3. **Extract** the ZIP file in File Manager
4. Delete the ZIP file after extraction

### 5. Set File Permissions

Set the following permissions using File Manager:

**Directories (755):**
- `styles/`
- `scripts/`
- `languages/`
- `assets/`

**Files (644):**
- `index.html`
- All `.css` files
- All `.js` files
- All `.json` files

### 6. Domain Configuration

#### For Main Domain
- Files uploaded to `public_html/`
- Access via: `https://yourdomain.com/`

#### For Subdomain
- Create subdomain in CPanel (e.g., `email.yourdomain.com`)
- Upload files to the subdomain's directory
- Access via: `https://email.yourdomain.com/`

#### For Subdirectory
- Create folder in `public_html/` (e.g., `email-redirect/`)
- Upload files to `public_html/email-redirect/`
- Access via: `https://yourdomain.com/email-redirect/`

### 7. Verify Installation

Visit your domain and check:

1. **Page Loads**: HTML structure appears correctly
2. **Styles Applied**: CSS themes and responsive design work
3. **JavaScript Active**: Buttons and inputs are functional
4. **Language Toggle**: English/Vietnamese switching works
5. **Theme Toggle**: Light/dark mode switching works
6. **API Connection**: Domain checking functionality works

### 8. Test Core Functionality

#### Email Validation Test
1. Enter invalid email: `invalid-email`
2. Should show: "Please enter a valid email address"

#### Domain Redirect Test
1. Enter test email: `test@gmail.com`
2. Should process and redirect appropriately

#### Theme Toggle Test
1. Click moon/sun icon
2. Page should switch between light/dark modes
3. Preference should persist on page reload

#### Language Toggle Test
1. Click globe icon
2. Interface should switch to Vietnamese
3. Language preference should persist

### 9. Troubleshooting Common Issues

#### **Styles Not Loading**
```bash
# Check file paths in index.html
<link rel="stylesheet" href="styles/main.css">
<link rel="stylesheet" href="styles/themes.css">
<link rel="stylesheet" href="styles/responsive.css">
```

**Solutions:**
- Verify CSS files are in `styles/` directory
- Check file permissions (should be 644)
- Clear browser cache

#### **JavaScript Not Working**
```bash
# Check script tags in index.html
<script src="scripts/utils.js"></script>
<script src="scripts/api.js"></script>
<script src="scripts/i18n.js"></script>
<script src="scripts/app.js"></script>
```

**Solutions:**
- Verify JS files are in `scripts/` directory
- Check browser console for errors
- Ensure files are not corrupted

#### **Language Files Not Loading**
```bash
# Check AJAX requests in browser dev tools
GET /languages/en.json
GET /languages/vi.json
```

**Solutions:**
- Verify JSON files are in `languages/` directory
- Check file permissions
- Ensure JSON syntax is valid

#### **API Errors**
```bash
# Check network requests to:
https://tmail.wibucrypto.pro/api/domains/nvf59twbGhxLNeo48ESZ
```

**Solutions:**
- Verify internet connection
- Check if API endpoint is accessible
- Review CORS settings if needed

### 10. Performance Optimization

#### Enable Gzip Compression
Add to `.htaccess` file in your domain root:
```apache
# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### Set Cache Headers
Add to `.htaccess` file:
```apache
# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/json "access plus 1 day"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

### 11. Security Configuration

#### Content Security Policy
Add to `.htaccess` file:
```apache
# Content Security Policy
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://tmail.wibucrypto.pro;"
</IfModule>
```

#### Force HTTPS
Add to `.htaccess` file:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 12. Backup Strategy

Create regular backups:
1. **Download** complete project files monthly
2. **Export** database if using custom domain lists
3. **Document** any custom modifications
4. **Test** backup restoration process

### 13. Monitoring and Maintenance

#### Regular Checks
- **Weekly**: Verify application loads correctly
- **Monthly**: Test all functionality (forms, redirects, themes)
- **Quarterly**: Check for any security updates needed

#### Log Monitoring
Check CPanel error logs for:
- 404 errors (missing files)
- JavaScript errors
- API connection issues

### 14. Custom Domain Configuration

If using a custom domain:

1. **Update DNS**: Point domain to your hosting
2. **SSL Certificate**: Install SSL certificate for HTTPS
3. **Configure Redirects**: Set up www/non-www redirects
4. **Test Thoroughly**: Verify all functionality with new domain

## Quick Deployment Commands (if SSH access available)

```bash
# Create project directory
mkdir -p public_html/email-redirect

# Set directory permissions
find public_html/email-redirect -type d -exec chmod 755 {} \;

# Set file permissions
find public_html/email-redirect -type f -exec chmod 644 {} \;

# Check file structure
ls -la public_html/email-redirect/
```

## Post-Deployment Checklist

After successful deployment:

- [ ] Test on different devices (mobile, tablet, desktop)
- [ ] Verify in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Check accessibility with screen readers
- [ ] Test with slow internet connections
- [ ] Verify theme persistence across sessions
- [ ] Test language switching functionality
- [ ] Confirm API integration works
- [ ] Check redirect functionality with test emails
- [ ] Verify error handling (try invalid emails)
- [ ] Test keyboard navigation
- [ ] Check responsive design breakpoints

## Support

If you encounter issues during deployment:

1. **Check file integrity**: Ensure all files uploaded correctly
2. **Review permissions**: Verify directory (755) and file (644) permissions
3. **Clear caches**: Clear browser and server caches
4. **Check logs**: Review CPanel error logs for specific issues
5. **Test step by step**: Isolate issues by testing individual components

The application is designed to be extremely robust and should work immediately after proper file upload and permission configuration.
