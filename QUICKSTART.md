# Page9 - Quick Start Guide

Get up and running with Page9 in 5 minutes!

## What is Page9?

Page9 brings Plan9's "everything is a file" philosophy to GitHub Pages. It uses Service Workers as a client-side kernel to create a zero-backend, fully static system.

## Quick Deploy to GitHub Pages

### Option 1: Fork This Repository

1. Fork this repository to your GitHub account
2. Go to **Settings** → **Pages**
3. Select the branch to deploy (e.g., `main`)
4. Visit `https://yourusername.github.io/page9`

Done! Your Page9 site is live.

### Option 2: Copy to Your Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/my-site.git
cd my-site

# Copy Page9 files (adjust path as needed)
cp /path/to/page9/* .

# Commit and push
git add .
git commit -m "Add Page9"
git push

# Enable GitHub Pages in repository settings
```

## Local Development

Start a local server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Visit: http://localhost:8000

## Verify Installation

1. Open the page in your browser
2. Check "Kernel Status" section
3. Should show:
   - ✅ Kernel: Active
   - ✅ Version: 0.1.0
   - ✅ Configuration loaded

## Test the System

Click the buttons on the main page:

- **Test Worker**: Verifies Web Worker functionality
- **Reload Config**: Reloads configuration
- **Clear Cache**: Clears Service Worker cache

Or visit the test page:
- http://localhost:8000/test.html
- Click "Run All Tests"
- All tests should pass ✅

## Customize Your Site

### 1. Edit Configuration

Edit `page9.config.json`:

```json
{
  "namespace": {
    "root": "/",
    "mounts": [
      {
        "path": "/api",
        "target": "/data",
        "type": "dir"
      }
    ]
  },
  "kernel": {
    "cachingStrategy": "cache-first"
  }
}
```

### 2. Add Routes

```json
{
  "routes": {
    "/about": {
      "file": "/about.html"
    },
    "/api/users": {
      "file": "/data/users.json",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### 3. Create Content

Create your HTML, CSS, JS, and JSON files as usual. Page9 will serve them through the Service Worker kernel.

## File Structure

```
your-site/
├── index.html              # Your main page
├── about.html              # Additional pages
├── data/                   # Data files
│   └── users.json
├── page9.config.json       # Configuration
├── sw.js                   # Service Worker kernel (don't modify)
├── page9.js               # Runtime (don't modify)
└── README.md              # Your docs
```

## Common Tasks

### Add a New Page

1. Create `mypage.html`
2. Add route in `page9.config.json`:
   ```json
   {
     "routes": {
       "/mypage": {
         "file": "/mypage.html"
       }
     }
   }
   ```

### Add Data File

1. Create `data/mydata.json`
2. Add route:
   ```json
   {
     "routes": {
       "/api/mydata": {
         "file": "/data/mydata.json",
         "headers": {
           "Content-Type": "application/json"
         }
       }
     }
   }
   ```

### Mount a Directory

```json
{
  "namespace": {
    "mounts": [
      {
        "path": "/content",
        "target": "/static/content",
        "type": "dir"
      }
    ]
  }
}
```

Access files: `/content/file.txt` → `/static/content/file.txt`

## Caching Strategies

Choose based on your needs:

```json
{
  "kernel": {
    "cachingStrategy": "cache-first"
  }
}
```

- **cache-first**: Fast, good for static content (default)
- **network-first**: Fresh, good for dynamic content
- **stale-while-revalidate**: Fast + fresh, best for frequently updated content

## Troubleshooting

### Service Worker Not Active

**Problem**: Kernel shows as inactive

**Solution**:
1. Make sure you're using HTTPS (or localhost)
2. Check browser console for errors
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache

### Configuration Not Loading

**Problem**: Configuration shows defaults

**Solution**:
1. Validate JSON syntax: https://jsonlint.com
2. Check file is at `/page9.config.json`
3. Look for CORS errors in console
4. Reload page

### Workers Not Working

**Problem**: Worker test fails

**Solution**:
1. Check `workers.enabled` is `true` in config
2. Check browser console for errors
3. Verify browser supports Web Workers
4. Try reloading the page

## Next Steps

- 📖 Read the [full documentation](README.md)
- 🏗️ Check the [architecture guide](ARCHITECTURE.md)
- 📝 Explore the [examples](EXAMPLES.md)
- 🚀 See the [deployment guide](DEPLOY.md)

## Getting Help

1. Check the [troubleshooting section](DEPLOY.md#troubleshooting)
2. Review browser console for errors
3. Verify configuration syntax
4. Check the examples for similar use cases

## Resources

- **Repository**: https://github.com/cogpilot/page9
- **GitHub Pages**: https://docs.github.com/en/pages
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Plan9**: https://9p.io/plan9/

---

**That's it!** You now have a fully functional Page9 site with zero backend requirements. 🎉

For more advanced usage, see the full documentation.
