# DollhouseMCP Website

🚧 **Under Development** - The official DollhouseMCP website showcasing AI-powered persona management and agent orchestration.

## Overview

This repository contains the source code for [dollhousemcp.com](https://dollhousemcp.com), including:
- Marketing and landing pages
- Technical blog posts and case studies
- Comprehensive design system with house-themed icons
- Strategic documentation and planning
- Meta-development demonstrations

## Current Status

The website is in active development with a phased rollout plan:
- **Phase 1**: Static site with documentation (Current)
- **Phase 2**: Interactive demos and playground
- **Phase 3**: Full platform integration

## Project Structure

```
website/
├── content/              # Website content
│   └── blog/            # Technical articles and case studies
├── docs/                # Strategic documentation
│   ├── development/     # Development processes
│   ├── WEBSITE_EVOLUTION_PLAN.md
│   ├── IMPLEMENTATION_PHASES.md
│   └── META_DEVELOPMENT_CASE_STUDY.md
├── icons/               # Brand assets and icons
├── mockups/             # HTML prototypes
│   ├── Dollhouse-Multipage-Mockup.css
│   └── Dollhouse-Sprite-Sheet.html
├── styles/              # CSS framework
│   ├── tokens.css      # Design tokens
│   ├── base.css        # Base styles
│   ├── components.css  # Component library
│   ├── house-icons.css # Icon system
│   ├── utilities.css   # Utility classes
│   └── pages/          # Page-specific styles
└── style-guide.html    # Component showcase
```

## Design System

### Features
- ✅ **Dark Mode Support** - Full theme switching capability
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Accessible** - WCAG 2.1 AA compliant colors
- ✅ **Modular CSS** - Component-based architecture
- ✅ **House Icons** - Unique branded icon system
- ✅ **Design Tokens** - Consistent spacing, colors, typography

### CSS Architecture
1. **Tokens** - Design system values
2. **Base** - Resets and defaults
3. **Components** - Reusable UI components
4. **Utilities** - Helper classes
5. **Pages** - Page-specific overrides

## Blog Content

High-quality technical articles covering:
- MCP server debugging and solutions
- Mobile development workflows
- CI/CD troubleshooting
- Meta-development case studies

All blog posts include:
- YAML frontmatter for CMS integration
- AI-friendly TL;DR summaries
- Comprehensive code examples
- SEO optimization

## Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/DollhouseMCP/website.git
cd website

# View the style guide
open style-guide.html

# Or start a simple HTTP server
python -m http.server 8000
# Visit http://localhost:8000
```

### Adding Content

#### New Blog Post
1. Create markdown file in `content/blog/`
2. Add YAML frontmatter
3. Write content using markdown

#### New Styles
- Components → `styles/components.css`
- Pages → `styles/pages/`
- Always use design tokens

## Meta-Development Achievement

This website was created using DollhouseMCP's own agent orchestration system, demonstrating:
- 85-90% time reduction in development
- AI-powered content generation
- Self-documenting capabilities
- Real-world platform validation

See `docs/development/META_DEVELOPMENT_CASE_STUDY.md` for full details.

## Roadmap

- [ ] Phase 1: Static documentation site
- [ ] Phase 2: Interactive demos
- [ ] Phase 3: Platform integration
- [ ] Blog CMS integration
- [ ] Search functionality
- [ ] Analytics dashboard

## License

Proprietary - All rights reserved.

## Contact

- GitHub: [@DollhouseMCP](https://github.com/DollhouseMCP)
- Email: mick@mickdarling.com

---

*Built with ❤️ using DollhouseMCP agent orchestration*