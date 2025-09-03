# Email Domain Redirect Panel

A simple, lightweight web application that redirects users to appropriate email services based on their email domain. Built for CPanel deployment with no dependencies or build processes required.

## Features

✅ **Smart Domain Detection** - Automatically detects email domains and redirects appropriately  
✅ **Dual Redirect Logic** - Internal domains → secure email service, External domains → temporary email generator  
✅ **Light/Dark Mode** - Automatic theme detection with manual toggle  
✅ **Bilingual Support** - English and Vietnamese with instant switching  
✅ **Responsive Design** - Works perfectly on all devices and screen sizes  
✅ **Accessibility First** - Full keyboard navigation and screen reader support  
✅ **Offline Caching** - Domain list cached for optimal performance  
✅ **Progressive Enhancement** - Works without JavaScript for basic functionality  

## Quick Start

### CPanel Deployment
1. Upload all files to your `public_html` directory (or subdirectory)
2. Ensure file permissions are set correctly (644 for files, 755 for directories)
3. Navigate to your domain to access the application

### Local Development
1. Clone/download the project files
2. Serve the files using any local server (Live Server, Python HTTP server, etc.)
3. Open `index.html` in your browser

## File Structure

```
capcut_domain_redirect/
├── index.html              # Main application page
├── styles/
│   ├── main.css           # Core styles and layout
│   ├── themes.css         # Light/dark theme definitions
│   └── responsive.css     # Mobile-first responsive design
├── scripts/
│   ├── app.js             # Main application logic
│   ├── api.js             # API handling and caching
│   ├── i18n.js            # Internationalization manager
│   └── utils.js           # Utility functions
├── languages/
│   ├── en.json            # English translations
│   └── vi.json            # Vietnamese translations
└── assets/                # (Empty - for future icons/images)
```

## How It Works

1. **User Input**: User enters email address in the input field
2. **Domain Extraction**: System extracts domain from the email (e.g., `example.com` from `user@example.com`)
3. **API Check**: Domain is checked against the internal domain list via API
4. **Smart Redirect**:
   - **If domain found**: Redirects to `https://tmail.wibucrypto.pro/mailbox/[email]`
   - **If not found**: Redirects to `https://generator.email/username@mail-temp.com/[email]`

## API Configuration

The application connects to:
- **Endpoint**: `https://tmail.wibucrypto.pro/api/domains/nvf59twbGhxLNeo48ESZ`
- **Cache Duration**: 5 minutes refresh interval, 15 minutes maximum age
- **Fallback**: Uses cached data if API is unavailable

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Mobile Browsers**: iOS Safari 11+, Chrome Mobile 60+, Samsung Internet
- **Graceful Degradation**: Basic functionality in older browsers

## Performance

- **Load Time**: < 1 second on 3G connection
- **Bundle Size**: < 50KB total (uncompressed)
- **Responsive**: 60fps animations and smooth interactions
- **Offline**: Cached domain data for improved reliability

## Accessibility Features

- **Keyboard Navigation**: Full tab order and keyboard shortcuts
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Clear focus indicators and logical flow

## Keyboard Shortcuts

- **Enter**: Submit email (when input is focused)
- **Escape**: Clear input or cancel current action
- **Ctrl/Cmd + T**: Toggle theme (light/dark mode)
- **Ctrl/Cmd + L**: Focus language toggle
- **Tab**: Navigate through interactive elements

## Language Support

### Currently Supported
- **English (EN)**: Default language with full feature coverage
- **Vietnamese (VI)**: Complete translation with proper grammar and context

### Adding New Languages
1. Create new JSON file in `languages/` directory (e.g., `fr.json`)
2. Follow the same structure as `en.json`
3. Add language code to `LANGUAGES` object in `utils.js`
4. Test all UI elements and messages

## Customization

### Theme Colors
Edit CSS variables in `styles/themes.css`:
```css
:root {
  --accent-primary: #007bff;  /* Change primary color */
  --bg-primary: #ffffff;      /* Change background */
  /* ... other variables */
}
```

### API Endpoint
Update the API configuration in `scripts/api.js`:
```javascript
const API_CONFIG = {
    baseUrl: 'https://your-api-domain.com',
    endpoints: {
        domains: '/your/api/endpoint'
    }
};
```

### Redirect URLs
Modify redirect templates in `scripts/utils.js`:
```javascript
const REDIRECT_TEMPLATES = {
    internal: 'https://your-internal-service.com/{email}',
    external: 'https://your-external-service.com/{email}'
};
```

## Troubleshooting

### Common Issues

**"Failed to load language data"**
- Check that `languages/` directory exists and contains `en.json` and `vi.json`
- Verify file permissions and CORS settings

**"API request failed"**
- Verify internet connection
- Check if API endpoint is accessible
- Review browser console for detailed error messages

**"Theme not saving"**
- Ensure localStorage is enabled in browser
- Check if site is running on HTTPS (required for some features)

**Styles not loading**
- Verify all CSS files exist in `styles/` directory
- Check file permissions (should be 644)
- Clear browser cache

### Debug Mode

Open browser developer tools and check:
```javascript
// Check application status
console.log(window.EmailRedirectApp.getStatus());

// Check API cache status
console.log(window.EmailRedirectAPI.getCacheStatus());

// Check current language
console.log(window.EmailRedirectI18n.getCurrentLanguageInfo());
```

## Security Considerations

- **Input Validation**: All email inputs are validated client-side
- **HTTPS Redirects**: All redirect URLs use HTTPS protocol
- **No Data Storage**: No user emails or personal data is stored
- **CORS Handling**: Proper error handling for cross-origin requests
- **Safe Redirects**: Redirect failures are handled gracefully

## Performance Optimization

- **Lazy Loading**: Language files loaded on demand
- **API Caching**: Domain list cached to reduce API calls
- **Debounced Input**: Input validation is debounced for performance
- **Minification Ready**: Code structure supports minification
- **CDN Compatible**: All assets can be served from CDN

## License

This project is provided as-is for CPanel deployment. Modify and use according to your needs.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all files are uploaded and accessible
4. Test with different browsers and devices
