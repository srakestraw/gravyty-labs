# 🎨 Gravyty Labs Assets

This directory contains all static assets for the Gravyty Labs platform.

## 📁 Directory Structure

```
public/assets/
├── logos/           # Company logos and brand assets
├── favicons/        # Favicon files for different devices
├── icons/           # App icons and UI icons
└── README.md        # This file
```

---

## 🏢 **Logos** (`/logos/`)

### **Required Logo Files**
- `gravyty-labs-logo.svg` - Main logo (SVG format)
- `gravyty-labs-logo.png` - Main logo (PNG format, high resolution)
- `gravyty-labs-logo-white.svg` - White version for dark backgrounds
- `gravyty-labs-logo-white.png` - White version (PNG format)
- `gravyty-labs-logo-horizontal.svg` - Horizontal layout version
- `gravyty-labs-logo-horizontal.png` - Horizontal layout (PNG format)
- `gravyty-labs-logo-stacked.svg` - Stacked/vertical layout version
- `gravyty-labs-logo-stacked.png` - Stacked layout (PNG format)

### **Logo Specifications**
- **SVG Format**: Vector format for scalability
- **PNG Format**: High resolution (300 DPI minimum)
- **Color Space**: RGB
- **Background**: Transparent for PNG files
- **Dimensions**: 
  - Horizontal: 200px height minimum
  - Vertical: 100px width minimum
  - Square: 200x200px minimum

### **Brand Colors**
- **Primary Blue**: #0052CC (Jira blue)
- **Secondary Purple**: #6554C0
- **Accent Teal**: #00B8D9
- **Dark Navy**: #0A1A2F (Sidebar background)

---

## 🌐 **Favicons** (`/favicons/`)

### **Required Favicon Files**
- `favicon.ico` - Standard favicon (16x16, 32x32, 48x48)
- `favicon-16x16.png` - 16x16 PNG favicon
- `favicon-32x32.png` - 32x32 PNG favicon
- `apple-touch-icon.png` - Apple touch icon (180x180)
- `android-chrome-192x192.png` - Android Chrome icon (192x192)
- `android-chrome-512x512.png` - Android Chrome icon (512x512)
- `safari-pinned-tab.svg` - Safari pinned tab icon (monochrome SVG)

### **Favicon Specifications**
- **ICO Format**: Multi-size ICO file (16x16, 32x32, 48x48)
- **PNG Format**: High quality PNG files
- **SVG Format**: Vector format for Safari pinned tabs
- **Background**: Solid color (no transparency for ICO)
- **Design**: Simple, recognizable at small sizes

---

## 🎯 **App Icons** (`/icons/`)

### **App-Specific Icons**
- `admissions-icon.svg` - Admissions Management app icon
- `admissions-icon.png` - Admissions Management app icon (PNG)
- `sis-icon.svg` - Student Information System app icon
- `sis-icon.png` - Student Information System app icon (PNG)
- `ai-teammates-icon.svg` - AI Teammates app icon
- `ai-teammates-icon.png` - AI Teammates app icon (PNG)

### **Icon Specifications**
- **SVG Format**: Vector format for scalability
- **PNG Format**: High resolution (512x512px minimum)
- **Style**: Consistent with brand guidelines
- **Colors**: Use brand color palette
- **Background**: Transparent for PNG files

---

## 📋 **Asset Guidelines**

### **File Naming Convention**
- Use kebab-case: `gravyty-labs-logo.svg`
- Include format in filename: `logo-horizontal.png`
- Include size when relevant: `favicon-32x32.png`
- Use descriptive names: `apple-touch-icon.png`

### **Quality Standards**
- **Vector Graphics**: Use SVG for logos and icons
- **Raster Graphics**: Use PNG for high-quality images
- **Compression**: Optimize file sizes without quality loss
- **Consistency**: Maintain consistent styling across all assets

### **Accessibility**
- **Contrast**: Ensure sufficient contrast ratios
- **Scalability**: Test at various sizes
- **Readability**: Ensure text/logos are readable at small sizes
- **Color Blindness**: Test with color vision deficiency simulators

---

## 🔧 **Implementation**

### **Next.js Integration**
```typescript
// In components
import Image from 'next/image';

<Image
  src="/assets/logos/gravyty-labs-logo.svg"
  alt="Gravyty Labs"
  width={200}
  height={100}
  priority
/>
```

### **Favicon Implementation**
```html
<!-- In app/layout.tsx -->
<link rel="icon" href="/assets/favicons/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png" />
<link rel="manifest" href="/assets/favicons/site.webmanifest" />
```

---

## 📝 **Asset Checklist**

### **Before Adding Assets**
- [ ] File follows naming convention
- [ ] Appropriate format (SVG for vectors, PNG for raster)
- [ ] Correct dimensions and resolution
- [ ] Optimized file size
- [ ] Tested at various sizes
- [ ] Brand guidelines compliance

### **After Adding Assets**
- [ ] Update component imports
- [ ] Test in different browsers
- [ ] Verify accessibility
- [ ] Update documentation
- [ ] Commit to version control

---

## 🎨 **Design Resources**

### **Recommended Tools**
- **Vector Graphics**: Adobe Illustrator, Figma, Sketch
- **Raster Graphics**: Adobe Photoshop, GIMP
- **Favicon Generation**: [Favicon.io](https://favicon.io/), [RealFaviconGenerator](https://realfavicongenerator.net/)
- **Image Optimization**: [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/)

### **Online Generators**
- **Favicon Generator**: [Favicon.io](https://favicon.io/)
- **Apple Touch Icon**: [Apple Touch Icon Generator](https://apple-touch-icon-generator.com/)
- **Android Icons**: [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

---

## 📞 **Support**

For questions about asset requirements or implementation:
- Check brand guidelines
- Review existing implementations
- Test across different devices and browsers
- Ensure accessibility compliance

---

**Last Updated**: October 2024  
**Version**: 1.0  
**Maintained By**: Gravyty Labs Development Team